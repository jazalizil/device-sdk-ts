import { type CommandErrors } from "@ledgerhq/device-management-kit";

export type SolanaAppErrorCodes =
  | "6700"
  | "6982"
  | "6A80"
  | "6A81"
  | "6A82"
  | "6B00"
  | "9000";

export const solanaAppErrors: CommandErrors<SolanaAppErrorCodes> = {
  "6700": { message: "Incorrect length" },
  "6982": { message: "Security status not satisfied (Canceled by user)" },
  "6A80": { message: "Invalid data" },
  "6A81": { message: "Invalid off-chain message header" },
  "6A82": { message: "Invalid off-chain message format" },
  "6B00": { message: "Incorrect parameter P1 or P2" },
  "9000": { message: "Normal ending of the command" },
};
