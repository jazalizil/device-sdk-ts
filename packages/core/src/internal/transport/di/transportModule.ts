import { ContainerModule } from "inversify";

import { SdkConfig } from "@api/SdkConfig";
import { Transport } from "@api/transport/model/Transport";
import { BuiltinTransports } from "@api/transport/model/TransportIdentifier";
import { TransportDataSource } from "@internal/transport/data/TransportDataSource";

import { transportDiTypes } from "./transportDiTypes";

type FactoryProps = {
  stub: boolean;
  transports: BuiltinTransports[];
  customTransports: Transport[];
  config: SdkConfig;
};

export const transportModuleFactory = ({
  stub = false,
  transports = [],
  customTransports = [],
  config,
}: Partial<FactoryProps> = {}) =>
  new ContainerModule((bind, _unbind, _isBound, _rebind) => {
    for (const transport of transports) {
      bind(transportDiTypes.Transport)
        .to(TransportDataSource.get(transport))
        .inSingletonScope();
    }
    for (const transport of customTransports) {
      bind(transportDiTypes.Transport).toConstantValue(transport);
    }
    bind(transportDiTypes.SdkConfig).toConstantValue(config);
    if (stub) {
      // Add stubs here
    }
  });
