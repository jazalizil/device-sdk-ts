import { DeviceModelDataSource } from "@internal/device-model/data/DeviceModelDataSource";
import { LoggerPublisherService } from "@internal/logger-publisher/service/LoggerPublisherService";

import { Transport } from "./Transport";

export interface TransportBuilder<
  T extends Transport,
  Config extends Record<string, unknown> = Record<string, unknown>,
> {
  setConfig(Config: Config): TransportBuilder<T, Config>;
  build(
    loggerFactory: (name: string) => LoggerPublisherService,
    deviceModelDataSource: DeviceModelDataSource,
  ): T;
}
