import { TransportDeviceModel } from "@ledgerhq/device-management-kit";

export class BleDeviceInfos {
  constructor(
    public deviceModel: TransportDeviceModel,
    public serviceUuid: string,
    public writeUuid: string,
    public writeCmdUuid: string,
    public notifyUuid: string,
  ) {}
}
