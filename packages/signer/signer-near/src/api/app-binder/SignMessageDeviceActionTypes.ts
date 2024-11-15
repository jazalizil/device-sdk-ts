import {
  type CommandErrorResult,
  type DeviceActionState,
  type ExecuteDeviceActionReturnType,
  type OpenAppDAError,
  type OpenAppDARequiredInteraction,
  type UserInteractionRequired,
} from "@ledgerhq/device-management-kit";
import { type Signature } from "near-api-js/lib/transaction";

import { type SendSignMessageTaskArgs } from "@internal/app-binder/task/SendSignMessageTask";

export type SignMessageDAOutput = Signature;

export type SignMessageDAInput = SendSignMessageTaskArgs;

export type SignMessageDAError = OpenAppDAError | CommandErrorResult["error"];

type SignMessageDARequiredInteraction =
  | OpenAppDARequiredInteraction
  | UserInteractionRequired.SignTransaction;

export type SignMessageDAIntermediateValue = {
  requiredUserInteraction: SignMessageDARequiredInteraction;
};

export type SignMessageDAState = DeviceActionState<
  SignMessageDAOutput,
  SignMessageDAError,
  SignMessageDAIntermediateValue
>;

export type SignMessageDAInternalState = {
  readonly error: SignMessageDAError | null;
  readonly signature: Signature | null;
};

export type SignMessageDAReturnType = ExecuteDeviceActionReturnType<
  SignMessageDAOutput,
  SignMessageDAError,
  SignMessageDAIntermediateValue
>;
