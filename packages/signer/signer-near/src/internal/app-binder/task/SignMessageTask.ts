import {
  ByteArrayBuilder,
  type CommandResult,
  CommandResultFactory,
  type InternalApi,
  InvalidStatusWordError,
  isSuccessCommandResult,
} from "@ledgerhq/device-management-kit";
import { Signature } from "near-api-js/lib/transaction";
import { KeyType } from "near-api-js/lib/utils/key_pair";
import { Maybe, Nothing } from "purify-ts";

import { SignMessageCommand } from "@internal/app-binder/command/SignMessageCommand";
import { SignTask } from "@internal/app-binder/task/SignTask";
import { DerivationPathUtils } from "@internal/shared/utils/DerivationPathUtils";
import { SignUtils } from "@internal/shared/utils/SignUtils";

const PATH_SIZE = 4;

export type SignMessageTaskArgs = {
  derivationPath: string;
  message: string;
};

export class SignMessageTask implements SignTask {
  private _api: Maybe<InternalApi> = Nothing;

  constructor(private args: SignMessageTaskArgs) {}

  set api(api: InternalApi) {
    this._api = Maybe.of(api);
  }

  async run(): Promise<CommandResult<Signature>> {
    const { derivationPath, message } = this.args;
    const paths = DerivationPathUtils.splitPath(derivationPath);

    const builder = new ByteArrayBuilder(
      message.length + 1 + paths.length * PATH_SIZE,
    );
    // add every derivation path
    paths.forEach((path) => {
      builder.add32BitUIntToData(path);
    });
    // add the transaction

    builder.addAsciiStringToData(message);

    const buffer = builder.build();
    return await this._api.mapOrDefault<Promise<CommandResult<Signature>>>(
      async (api) => {
        const utils = new SignUtils(api);
        const result = await utils.signInChunks(SignMessageCommand, buffer);

        if (isSuccessCommandResult(result) && result.data.isJust()) {
          return CommandResultFactory({
            data: new Signature({
              data: result.data.extract(),
              keyType: KeyType.ED25519,
            }),
          });
        }

        return CommandResultFactory({
          error: new InvalidStatusWordError("no signature returned"),
        });
      },
      Promise.resolve(
        CommandResultFactory({
          error: new InvalidStatusWordError("no api"),
        }),
      ),
    );
  }
}
