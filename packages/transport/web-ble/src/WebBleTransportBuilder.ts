import {
  DefaultApduReceiverService,
  DefaultApduSenderService,
  DeviceModelDataSource,
  FramerConst,
  FramerUtils,
  LoggerPublisherService,
  TransportBuilder,
  TransportInitializationError,
  WebBleTransport,
} from "@ledgerhq/device-management-kit";

export class WebBleTransportBuilder
  implements TransportBuilder<WebBleTransport>
{
  private readonly _randomChannel: Uint8Array = FramerUtils.numberToByteArray(
    Math.floor(Math.random() * 0xffff),
    FramerConst.CHANNEL_LENGTH,
  );
  private _loggerFactory?: (name: string) => LoggerPublisherService;
  private _deviceModelDataSource?: DeviceModelDataSource;

  setLoggerFactory(
    loggerFactory: (name: string) => LoggerPublisherService,
  ): TransportBuilder<WebBleTransport> {
    this._loggerFactory = loggerFactory;
    return this;
  }
  setDeviceModelDataSource(
    deviceModelDataSource: DeviceModelDataSource,
  ): TransportBuilder<WebBleTransport> {
    this._deviceModelDataSource = deviceModelDataSource;
    return this;
  }
  setConfig(): TransportBuilder<WebBleTransport> {
    throw new Error("Method not implemented.");
  }
  build(): WebBleTransport {
    if (!this._loggerFactory) {
      throw new TransportInitializationError(
        "Missing logger publisher factory",
      );
    }
    if (!this._deviceModelDataSource) {
      throw new TransportInitializationError("Missing deviceModelDataSource");
    }
    const apduSender = new DefaultApduSenderService({
      loggerFactory: this._loggerFactory,
      channel: this._randomChannel,
    });
    const apduReceiver = new DefaultApduReceiverService({
      channel: this._randomChannel,
      loggerFactory: this._loggerFactory,
    });

    return new WebBleTransport(
      apduSender,
      apduReceiver,
      this._deviceModelDataSource,
      this._loggerFactory,
    );
  }
}
