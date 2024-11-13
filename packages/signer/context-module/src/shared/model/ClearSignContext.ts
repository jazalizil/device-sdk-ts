import { type GenericPath } from "./GenericPath";

export enum ClearSignContextType {
  TOKEN = "token",
  NFT = "nft",
  DOMAIN_NAME = "domainName",
  TRUSTED_NAME = "trustedName",
  PLUGIN = "plugin",
  EXTERNAL_PLUGIN = "externalPlugin",
  TRANSACTION_INFO = "transactionInfo",
  ENUM = "enum",
  TRANSACTION_FIELD_DESCRIPTION = "transactionFieldDescription",
  ERROR = "error",
}

export type ClearSignContextReference =
  | {
      type: Exclude<
        ClearSignContextType,
        ClearSignContextType.TRUSTED_NAME | ClearSignContextType.ERROR
      >;
      value_path: GenericPath;
    }
  | {
      type: ClearSignContextType.TRUSTED_NAME;
      value_path: GenericPath;
      types: string[];
      sources: string[];
    };

export type ClearSignContextSuccess = {
  type: Exclude<ClearSignContextType, ClearSignContextType.ERROR>;
  /**
   * Hexadecimal string representation of the payload.
   */
  payload: string;
  /**
   * Optional reference to another asset descriptor.
   * ie: a 'transactionFieldDescription' descriptor can reference a token or
   * a trusted name.
   */
  reference?: ClearSignContextReference;
};

export type ClearSignContextError = {
  type: ClearSignContextType.ERROR;
  error: Error;
};

export type ClearSignContext = ClearSignContextSuccess | ClearSignContextError;
