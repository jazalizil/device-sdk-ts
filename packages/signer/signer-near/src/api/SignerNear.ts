import { type GetPublicKeyCommandArgs } from "@api/app-binder/GetPublicKeyCommandTypes";
import { type GetPublicKeyDAReturnType } from "@api/app-binder/GetPublicKeyDeviceActionTypes";
import { type GetVersionDAReturnType } from "@api/app-binder/GetVersionDeviceActionTypes";
import { type GetWalletIdCommandArgs } from "@api/app-binder/GetWalletIdCommandTypes";
import { type GetWalletIdDAReturnType } from "@api/app-binder/GetWalletIdDeviceActionTypes";
import { type SignDAReturnType } from "@api/app-binder/SignDeviceActionTypes";
import { type SignMessageTaskArgs } from "@internal/app-binder/task/SignMessageTask";
import { SignTransactionTaskArgs } from "@internal/app-binder/task/SignTransactionTask";

export interface SignerNear {
  getWalletId(
    args: GetWalletIdCommandArgs,
    inspect?: boolean,
  ): GetWalletIdDAReturnType;
  getPublicKey(
    args: GetPublicKeyCommandArgs,
    inspect?: boolean,
  ): GetPublicKeyDAReturnType;
  signMessage(args: SignMessageTaskArgs, inspect?: boolean): SignDAReturnType;
  signTransaction(
    args: SignTransactionTaskArgs,
    inspect?: boolean,
  ): SignDAReturnType;
  getVersion(inspect?: boolean): GetVersionDAReturnType;
}
