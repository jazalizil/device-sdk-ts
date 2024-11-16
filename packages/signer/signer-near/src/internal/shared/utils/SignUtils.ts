import {
  APDU_MAX_PAYLOAD,
  Command,
  CommandResultFactory,
  InternalApi,
  isSuccessCommandResult,
} from "@ledgerhq/device-management-kit";
import { type Maybe, Nothing } from "purify-ts";

type SignCommandArgs = {
  data: Uint8Array;
  isFirstChunk: boolean;
};

export class SignUtils {
  constructor(
    private readonly api: InternalApi,
    private readonly chunkSize: number = APDU_MAX_PAYLOAD,
  ) {}
  async signInChunks<CommandResponse>(
    command: {
      new (args: SignCommandArgs): Command<CommandResponse, SignCommandArgs>;
    },
    buffer: Uint8Array,
  ) {
    let result = CommandResultFactory<CommandResponse | Maybe<never>>({
      data: Nothing,
    });

    for (let i = 0; i < buffer.length; i += this.chunkSize) {
      result = await this.api.sendCommand(
        new command({
          data: buffer.slice(i, i + this.chunkSize),
          isFirstChunk: i === 0,
        }),
      );

      if (!isSuccessCommandResult(result)) {
        return result;
      }
    }
    return result;
  }
}
