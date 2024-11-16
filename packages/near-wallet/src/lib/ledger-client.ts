import {
  SignerNear,
  SignerNearBuilder,
} from "@ledgerhq/device-signer-kit-near";
import {
  BuiltinTransports,
  ConsoleLogger,
  DeviceActionStatus,
  DeviceManagementKit,
  DeviceManagementKitBuilder,
} from "@ledgerhq/device-management-kit";
import { LoggerService } from "@near-wallet-selector/core/src/lib/services";
import { lastValueFrom } from "rxjs";

interface GetPublicKeyParams {
  derivationPath: string;
}

interface SignMessageParams {
  message: string;
  derivationPath: string;
}

interface SignTransactionParams {
  transaction: Uint8Array;
  derivationPath: string;
}

export interface Subscription {
  remove: () => void;
}

// Not using TransportWebHID.isSupported as it's chosen to use a Promise...
export const isLedgerSupported = () => {
  return true;
};

export class LedgerClient {
  private dmk: DeviceManagementKit;
  private signer: SignerNear | null = null;

  constructor(logger: LoggerService) {
    this.dmk = new DeviceManagementKitBuilder()
      .addTransport(BuiltinTransports.USB)
      .addTransport(BuiltinTransports.BLE)
      .addLogger(new ConsoleLogger())
      .addLogger(logger)
      .build();
  }

  isConnected = () => {
    return Boolean(this.signer);
  };

  connect = async () => {
    // [COULD] use web-ble here
    this.dmk
      .startDiscovering({ transport: BuiltinTransports.USB })
      .subscribe(async (device) => {
        const sessionId = await this.dmk.connect({ device });
        this.signer = new SignerNearBuilder({
          dmk: this.dmk,
          sessionId,
        }).build();
      });
  };

  disconnect = async () => {
    await this.dmk.close();
  };

  getVersion = async () => {
    if (!this.signer) {
      throw new Error("Not connected");
    }
    const { observable } = this.signer.getVersion();
    const deviceActionState = await lastValueFrom(observable);
    if (deviceActionState.status === DeviceActionStatus.Completed) {
      return deviceActionState.output.version;
    } else if (deviceActionState.status === DeviceActionStatus.Error) {
      return Promise.reject(deviceActionState.error);
    }
    return "";
  };

  getPublicKey = async ({ derivationPath }: GetPublicKeyParams) => {
    if (!this.signer) {
      throw new Error("Not connected");
    }
    const { observable } = this.signer.getPublicKey({
      derivationPath,
      checkOnDevice: true,
    });
    const deviceActionState = await lastValueFrom(observable);
    if (deviceActionState.status === DeviceActionStatus.Completed) {
      return deviceActionState.output.address;
    } else if (deviceActionState.status === DeviceActionStatus.Error) {
      throw deviceActionState.error;
    }
    return "";
  };

  signMessage = async ({ message, derivationPath }: SignMessageParams) => {
    if (!this.signer) {
      throw new Error("Not connected");
    }
    const { observable } = this.signer.signMessage({
      derivationPath,
      message,
    });
    const deviceActionState = await lastValueFrom(observable);
    if (deviceActionState.status === DeviceActionStatus.Completed) {
      return deviceActionState.output.signature;
    } else if (deviceActionState.status === DeviceActionStatus.Error) {
      throw deviceActionState.error;
    }
    throw new Error("Invalid data or derivation path");
  };

  signTransaction = async ({
    transaction,
    derivationPath,
  }: SignTransactionParams) => {
    if (!this.signer) {
      throw new Error("Not connected");
    }
    const { observable } = this.signer.signTransaction({
      derivationPath,
      transaction,
    });
    const deviceActionState = await lastValueFrom(observable);
    if (deviceActionState.status === DeviceActionStatus.Completed) {
      return deviceActionState.output.signature;
    } else if (deviceActionState.status === DeviceActionStatus.Error) {
      throw deviceActionState.error;
    }
    throw new Error("Invalid data or derivation path");
  };
}
