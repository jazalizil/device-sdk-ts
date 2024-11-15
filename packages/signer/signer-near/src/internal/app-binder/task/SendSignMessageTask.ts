import {
  APDU_MAX_PAYLOAD,
  ByteArrayBuilder,
  type CommandResult,
  CommandResultFactory,
  type InternalApi,
  InvalidStatusWordError,
  isSuccessCommandResult,
} from "@ledgerhq/device-management-kit";
import { Signature } from "near-api-js/lib/transaction";
import { KeyType } from "near-api-js/lib/utils/key_pair";
import { Nothing } from "purify-ts";

import {
  SignMessageCommand,
  type SignMessageCommandResponse,
} from "@internal/app-binder/command/SignMessageCommand";
import { DerivationPathUtils } from "@internal/shared/utils/DerivationPathUtils";

const PATH_SIZE = 4;

export type SendSignMessageTaskArgs = {
  derivationPath: string;
  message: string | Uint8Array;
};

export class SendSignMessageTask {
  constructor(
    private api: InternalApi,
    private args: SendSignMessageTaskArgs,
  ) {}

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
    if (typeof message === "string") {
      builder.addAsciiStringToData(message);
    } else {
      builder.addBufferToData(message);
    }

    const buffer = builder.build();

    let result = CommandResultFactory<SignMessageCommandResponse, void>({
      data: Nothing,
    });

    // Split the buffer into chunks
    for (let i = 0; i < buffer.length; i += APDU_MAX_PAYLOAD) {
      result = await this.api.sendCommand(
        new SignMessageCommand({
          message: buffer.slice(i, i + APDU_MAX_PAYLOAD),
          isFirstChunk: i === 0,
        }),
      );

      if (!isSuccessCommandResult(result)) {
        return result;
      }
    }

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
  }
}
