import { DeviceActionStatus } from "@ledgerhq/device-management-kit";
import { inject } from "inversify";
import * as NearApi from "near-api-js";
import { PublicKey } from "near-api-js/lib/utils";
import { KeyType, type Signature } from "near-api-js/lib/utils/key_pair";

import type { SignerNear } from "@api/SignerNear";
import { appBinderTypes } from "@internal/app-binder/di/appBinderTypes";
const DEFAULT_DERIVATION_PATH = "44'/397'/0'/0'/1";

export class WebSignerNear implements NearApi.Signer {
  constructor(
    @inject(appBinderTypes.AppBinder) private readonly _appBinder: SignerNear,
  ) {}
  getPublicKey({ derivationPath }: { derivationPath: string }) {
    const { observable } = this._appBinder.getPublicKey({
      derivationPath: derivationPath,
      checkOnDevice: true,
    });
    return new Promise<PublicKey>((resolve, reject) => {
      observable.subscribe((deviceActionState) => {
        if (deviceActionState.status === DeviceActionStatus.Completed) {
          const address = NearApi.utils.serialize.base_encode(
            deviceActionState.output.address,
          );
          resolve(NearApi.utils.PublicKey.from(address));
        } else if (deviceActionState.status === DeviceActionStatus.Error) {
          reject(deviceActionState.error);
        }
      });
    });
  }
  getWalletId() {}
  signMessage(message: Uint8Array) {
    const { observable } = this._appBinder.signMessage({
      message,
      derivationPath: DEFAULT_DERIVATION_PATH,
    });
    return new Promise<Signature>((resolve, reject) => {
      observable.subscribe((deviceActionState) => {
        if (deviceActionState.status === DeviceActionStatus.Completed) {
          resolve({
            signature: deviceActionState.output.signature.data,
            publicKey: new PublicKey({
              keyType: KeyType.ED25519,
              data: deviceActionState.output.signature.data,
            }),
          });
        } else if (deviceActionState.status === DeviceActionStatus.Error) {
          reject(deviceActionState.error);
        }
      });
    });
  }
  createKey(): Promise<PublicKey> {
    const keyPair = NearApi.KeyPair.fromRandom("ed25519");
    return Promise.resolve(keyPair.getPublicKey());
  }
}
