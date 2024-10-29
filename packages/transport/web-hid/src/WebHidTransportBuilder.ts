import {
  DefaultApduReceiverService,
  DefaultApduSenderService,
  DeviceModelDataSource,
  FramerConst,
  FramerUtils,
  LoggerPublisherService,
  TransportBuilder,
  TransportInitializationError,
} from "@ledgerhq/device-management-kit";

import { FRAME_SIZE } from "./UsbHidConfig";
import { WebHidTransport } from "./WebHidTransport";

export class WebHidTransportBuilder
  implements TransportBuilder<WebHidTransport>
{
  private readonly _randomChannel: Uint8Array = FramerUtils.numberToByteArray(
    Math.floor(Math.random() * 0xffff),
    FramerConst.CHANNEL_LENGTH,
  );
  private _loggerFactory?: (name: string) => LoggerPublisherService;
  private _deviceModelDataSource?: DeviceModelDataSource;

  setLoggerFactory(
    loggerFactory: (name: string) => LoggerPublisherService,
  ): TransportBuilder<WebHidTransport> {
    this._loggerFactory = loggerFactory;
    return this;
  }
  setDeviceModelDataSource(
    deviceModelDataSource: DeviceModelDataSource,
  ): TransportBuilder<WebHidTransport> {
    this._deviceModelDataSource = deviceModelDataSource;
    return this;
  }
  setConfig(): TransportBuilder<WebHidTransport> {
    throw new Error("Method not implemented.");
  }
  build(): WebHidTransport {
    if (!this._loggerFactory) {
      throw new TransportInitializationError(
        "Missing logger publisher factory",
      );
    }
    if (!this._deviceModelDataSource) {
      throw new TransportInitializationError("Missing deviceModelDataSource");
    }
    const apduSender = new DefaultApduSenderService({
      frameSize: FRAME_SIZE,
      loggerFactory: this._loggerFactory,
      channel: this._randomChannel,
      padding: true,
    });
    const apduReceiver = new DefaultApduReceiverService({
      channel: this._randomChannel,
      loggerFactory: this._loggerFactory,
    });

    return new WebHidTransport(
      apduSender,
      apduReceiver,
      this._deviceModelDataSource,
      this._loggerFactory,
    );
  }
}
