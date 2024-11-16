import type {
  CommandResult,
  InternalApi,
} from "@ledgerhq/device-management-kit";
import { type Signature } from "near-api-js/lib/transaction";

export interface SignTask {
  set api(api: InternalApi);
  run: () => Promise<CommandResult<Signature>>;
}
