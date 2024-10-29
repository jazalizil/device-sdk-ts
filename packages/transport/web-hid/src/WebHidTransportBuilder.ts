import {
  DefaultApduReceiverService,
  DefaultApduSenderService,
  DeviceModelDataSource,
  FramerConst,
  FramerUtils,
  LoggerPublisherService,
  TransportBuilder,
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
  setConfig(): TransportBuilder<WebHidTransport> {
    throw new Error("Method not implemented.");
  }
  build(
    loggerFactory: (name: string) => LoggerPublisherService,
    deviceModelDataSource: DeviceModelDataSource,
  ): WebHidTransport {
    const apduSender = new DefaultApduSenderService({
      frameSize: FRAME_SIZE,
      loggerFactory,
      channel: this._randomChannel,
      padding: true,
    });
    const apduReceiver = new DefaultApduReceiverService({
      channel: this._randomChannel,
      loggerFactory,
    });

    return new WebHidTransport(
      apduSender,
      apduReceiver,
      deviceModelDataSource,
      loggerFactory,
    );
  }
}
