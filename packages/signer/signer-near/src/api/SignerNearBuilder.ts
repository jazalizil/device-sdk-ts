import {
  type DeviceManagementKit,
  type DeviceSessionId,
} from "@ledgerhq/device-management-kit";

import { DefaultSignerNear } from "@internal/app-binder/DefaultSignerNear";
import { WebSignerNear } from "@internal/app-binder/WebSignerNear";

import { type SignerNear } from "./SignerNear";

type KeyringNearBuilderConstructorArgs = {
  dmk: DeviceManagementKit;
  sessionId: string;
};

export class SignerNearBuilder {
  private _dmk: DeviceManagementKit;
  private _sessionId: DeviceSessionId;

  constructor({ dmk, sessionId }: KeyringNearBuilderConstructorArgs) {
    this._dmk = dmk;
    this._sessionId = sessionId;
  }

  public build(version?: "ledger"): SignerNear;
  public build(version: "web"): WebSignerNear;
  public build(
    version: "ledger" | "web" = "ledger",
  ): SignerNear | WebSignerNear {
    const signer = new DefaultSignerNear(this._dmk, this._sessionId);
    if (version === "web") {
      return new WebSignerNear(signer);
    }
    return signer;
  }
}
