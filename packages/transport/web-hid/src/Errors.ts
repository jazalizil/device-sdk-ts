import {
  GeneralSdkError,
  NoAccessibleDeviceError,
} from "@ledgerhq/device-management-kit";

export class HidSendReportError extends GeneralSdkError {
  override readonly _tag = "HidSendReportError";
  constructor(readonly err?: unknown) {
    super(err);
  }
}

export class UsbHidTransportNotSupportedError extends GeneralSdkError {
  override readonly _tag = "UsbHidTransportNotSupportedError";
  constructor(readonly err?: unknown) {
    super(err);
  }
}

export type PromptDeviceAccessError =
  | UsbHidTransportNotSupportedError
  | NoAccessibleDeviceError;
