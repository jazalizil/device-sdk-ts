import {
  type CommandErrorResult,
  type DeviceActionState,
  type ExecuteDeviceActionReturnType,
  type OpenAppDAError,
  type OpenAppDARequiredInteraction,
  type UserInteractionRequired,
} from "@ledgerhq/device-management-kit";
import { type Signature } from "near-api-js/lib/transaction";
import { SignTask } from "@internal/app-binder/task/SignTask";

export type SignDAOutput = Signature;

export type SignDAInput = {
  task: SignTask;
};

export type SignDAError = OpenAppDAError | CommandErrorResult["error"];

type SignDARequiredInteraction =
  | OpenAppDARequiredInteraction
  | UserInteractionRequired.SignTransaction;

export type SignDAIntermediateValue = {
  requiredUserInteraction: SignDARequiredInteraction;
};

export type SignDAState = DeviceActionState<
  SignDAOutput,
  SignDAError,
  SignDAIntermediateValue
>;

export type SignDAInternalState = {
  readonly error: SignDAError | null;
  readonly signature: Signature | null;
};

export type SignDAReturnType = ExecuteDeviceActionReturnType<
  SignDAOutput,
  SignDAError,
  SignDAIntermediateValue
>;
