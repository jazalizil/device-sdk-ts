import { type GetPublicKeyCommandArgs } from "@api/app-binder/GetPublicKeyCommandTypes";
import { type GetPublicKeyDAReturnType } from "@api/app-binder/GetPublicKeyDeviceActionTypes";
import { type GetWalletIdCommandArgs } from "@api/app-binder/GetWalletIdCommandTypes";
import { type GetWalletIdDAReturnType } from "@api/app-binder/GetWalletIdDeviceActionTypes";
import { type SignMessageDAReturnType } from "@api/app-binder/SignMessageDeviceActionTypes";
import { type SendSignMessageTaskArgs } from "@internal/app-binder/task/SendSignMessageTask";

export interface SignerNear {
  getWalletId(
    args: GetWalletIdCommandArgs,
    inspect?: boolean,
  ): GetWalletIdDAReturnType;
  getPublicKey(
    args: GetPublicKeyCommandArgs,
    inspect?: boolean,
  ): GetPublicKeyDAReturnType;
  signMessage(
    args: SendSignMessageTaskArgs,
    inspect?: boolean,
  ): SignMessageDAReturnType;
}
