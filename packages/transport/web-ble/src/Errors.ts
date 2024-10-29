import {
  GeneralSdkError,
  NoAccessibleDeviceError,
} from "@ledgerhq/device-management-kit";

export class BleTransportNotSupportedError extends GeneralSdkError {
  override readonly _tag = "BleTransportNotSupportedError";
}

export type PromptDeviceAccessError =
  | BleTransportNotSupportedError
  | NoAccessibleDeviceError;
