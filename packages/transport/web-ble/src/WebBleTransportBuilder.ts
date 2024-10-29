import {
  DefaultApduReceiverService,
  DefaultApduSenderService,
  DeviceModelDataSource,
  FramerConst,
  FramerUtils,
  LoggerPublisherService,
  TransportBuilder,
  WebBleTransport,
} from "@ledgerhq/device-management-kit";

export class WebBleTransportBuilder
  implements TransportBuilder<WebBleTransport>
{
  private readonly _randomChannel: Uint8Array = FramerUtils.numberToByteArray(
    Math.floor(Math.random() * 0xffff),
    FramerConst.CHANNEL_LENGTH,
  );

  setConfig(): TransportBuilder<WebBleTransport> {
    throw new Error("Method not implemented.");
  }
  build(
    loggerFactory: (name: string) => LoggerPublisherService,
    deviceModelDataSource: DeviceModelDataSource,
  ): WebBleTransport {
    const apduSender = new DefaultApduSenderService({
      loggerFactory,
      channel: this._randomChannel,
    });
    const apduReceiver = new DefaultApduReceiverService({
      channel: this._randomChannel,
      loggerFactory,
    });

    return new WebBleTransport(
      apduSender,
      apduReceiver,
      deviceModelDataSource,
      loggerFactory,
    );
  }
}
