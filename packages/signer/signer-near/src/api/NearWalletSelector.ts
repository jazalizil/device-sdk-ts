import {
  BuiltinTransports,
  DeviceManagementKit,
  DeviceManagementKitBuilder,
} from "@ledgerhq/device-management-kit";
import {
  Account,
  FinalExecutionOutcome,
  getActiveAccount,
  HardwareWallet,
  JsonStorageService,
  Optional,
  Subscription,
  Transaction,
  WalletBehaviourFactory,
  WalletModuleFactory,
} from "@near-wallet-selector/core";
import { LoggerService } from "@near-wallet-selector/core/src/lib/services";
import { signTransactions } from "@near-wallet-selector/wallet-utils";
import * as NearApi from "near-api-js";

import { SignerNearBuilder } from "@root/lib/types";

interface LedgerAccount extends Account {
  derivationPath: string;
  publicKey: string;
}
interface LedgerState {
  dmk: DeviceManagementKit;
  accounts: Array<LedgerAccount>;
  subscriptions: Array<Subscription>;
}

interface ValidateAccessKeyParams {
  accountId: string;
  publicKey: string;
}

export const STORAGE_ACCOUNTS = "accounts";

const setupLedgerState = async (
  storage: JsonStorageService,
  logger: LoggerService,
): Promise<LedgerState> => {
  const accounts =
    await storage.getItem<Array<LedgerAccount>>(STORAGE_ACCOUNTS);
  const dmk = new DeviceManagementKitBuilder()
    .addLogger(logger)
    .addTransport(BuiltinTransports.USB)
    .addTransport(BuiltinTransports.BLE)
    .build();

  return {
    dmk,
    subscriptions: [],
    accounts: accounts || [],
  };
};

const LedgerWallet: WalletBehaviourFactory<HardwareWallet> = async ({
  options,
  store,
  provider,
  logger,
  storage,
  metadata,
}) => {
  const _state = await setupLedgerState(storage, logger);
  let signer: NearApi.Signer;
  let sessionId: string;
  const getAccounts = (): Array<Account> => {
    return _state.accounts.map((x) => ({
      accountId: x.accountId,
      publicKey: "ed25519:" + x.publicKey,
    }));
  };
  const cleanup = () => {
    _state.subscriptions.forEach((subscription) => subscription.remove());

    _state.subscriptions = [];
    _state.accounts = [];

    storage.removeItem(STORAGE_ACCOUNTS);
  };

  const signOut = () => {
    if (sessionId) {
      _state.dmk.disconnect({ sessionId });
    }

    cleanup();
    return Promise.resolve();
  };

  const validateAccessKey = ({
    accountId,
    publicKey,
  }: ValidateAccessKeyParams) => {
    logger.log("validateAccessKey", { accountId, publicKey });

    return provider.viewAccessKey({ accountId, publicKey }).then(
      (accessKey) => {
        logger.log("validateAccessKey:accessKey", { accessKey });

        if (accessKey.permission !== "FullAccess") {
          throw new Error("Public key requires 'FullAccess' permission");
        }

        return accessKey;
      },
      (err) => {
        if (err.type === "AccessKeyDoesNotExist") {
          return null;
        }

        throw err;
      },
    );
  };
  const transformTransactions = (
    transactions: Array<Optional<Transaction, "signerId" | "receiverId">>,
  ): Array<Transaction> => {
    const { contract } = store.getState();

    if (!contract) {
      throw new Error("Wallet not signed in");
    }

    const account = getActiveAccount(store.getState());

    if (!account) {
      throw new Error("No active account");
    }

    return transactions.map((transaction) => {
      return {
        signerId: transaction.signerId || account.accountId,
        receiverId: transaction.receiverId || contract.contractId,
        actions: transaction.actions,
      };
    });
  };

  const connectLedgerDevice = async () => {
    return new Promise((resolve, reject) => {
      _state.dmk
        .startDiscovering({ transport: BuiltinTransports.USB })
        .subscribe({
          next: async (device) => {
            sessionId = await _state.dmk.connect({ device });
            signer = new SignerNearBuilder({
              dmk: _state.dmk,
              sessionId,
            }).build("web");

            resolve(void 0);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  };

  return {
    async signIn({ accounts }) {
      const existingAccounts = getAccounts();

      if (existingAccounts.length) {
        return existingAccounts;
      }

      const ledgerAccounts: Array<LedgerAccount> = [];

      for (let i = 0; i < accounts.length; i++) {
        const { derivationPath, accountId, publicKey } = accounts[i]!;

        const accessKey = await validateAccessKey({ accountId, publicKey });

        if (!accessKey) {
          throw new Error(
            `Public key is not registered with the account '${accountId}'.`,
          );
        }

        ledgerAccounts.push({
          accountId,
          derivationPath,
          publicKey,
        });
      }

      await storage.setItem(STORAGE_ACCOUNTS, ledgerAccounts);
      _state.accounts = ledgerAccounts;

      return getAccounts();
    },

    signOut,

    async getAccounts() {
      return getAccounts();
    },

    async signAndSendTransaction({ signerId, receiverId, actions }) {
      logger.log("signAndSendTransaction", { signerId, receiverId, actions });

      if (!_state.accounts.length) {
        throw new Error("Wallet not signed in");
      }

      // Note: Connection must be triggered by user interaction.
      await connectLedgerDevice();

      const signedTransactions = await signTransactions(
        transformTransactions([{ signerId, receiverId, actions }]),
        signer,
        options.network,
      );

      return provider.sendTransaction(signedTransactions[0]!);
    },
    async signAndSendTransactions({ transactions }) {
      logger.log("signAndSendTransactions", { transactions });

      if (!_state.accounts.length) {
        throw new Error("Wallet not signed in");
      }

      // Note: Connection must be triggered by user interaction.
      await connectLedgerDevice();

      const signedTransactions = await signTransactions(
        transformTransactions(transactions),
        signer,
        options.network,
      );

      const results: Array<FinalExecutionOutcome> = [];

      for (let i = 0; i < signedTransactions.length; i++) {
        results.push(await provider.sendTransaction(signedTransactions[i]!));
      }

      return results;
    },
    async verifyOwner({ message }) {
      logger.log("Ledger:verifyOwner", { message });

      throw new Error(`Method not supported by ${metadata.name}`);
    },
    async getPublicKey(derivationPath: string) {
      await connectLedgerDevice();

      return signer.getPublicKey({ derivationPath });
    },
  };
};

export function setupLedger({
  iconUrl = "",
  deprecated = false,
} = {}): WalletModuleFactory<HardwareWallet> {
  return async () => {
    return Promise.resolve({
      id: "ledger",
      type: "hardware",
      metadata: {
        name: "Ledger",
        description:
          "Protect crypto assets with the most popular hardware wallet.",
        iconUrl,
        deprecated,
        available: true,
      },
      init: LedgerWallet,
    });
  };
}
