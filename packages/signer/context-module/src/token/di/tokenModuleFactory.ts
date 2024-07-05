import { ContainerModule } from "inversify";

import { HttpTokenDataSource } from "@/token/data/HttpTokenDataSource";
import { tokenTypes } from "@/token/di/tokenTypes";
import { TokenContextLoader } from "@/token/domain/TokenContextLoader";

export const tokenModuleFactory = () =>
  new ContainerModule((bind, _unbind, _isBound, _rebind) => {
    bind(tokenTypes.TokenDataSource).to(HttpTokenDataSource);
    bind(tokenTypes.TokenContextLoader).to(TokenContextLoader);
  });
