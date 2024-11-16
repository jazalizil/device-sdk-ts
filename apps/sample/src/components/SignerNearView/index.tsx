import React, { useMemo } from "react";
import {
  type GetPublicKeyDAError,
  type GetPublicKeyDAIntermediateValue,
  type GetPublicKeyDAOutput,
  GetVersionDAError,
  GetVersionDAIntermediateValue,
  GetVersionDAOutput,
  type GetWalletIdDAError,
  type GetWalletIdDAIntermediateValue,
  type GetWalletIdDAOutput,
  SignDAError,
  type SignDAIntermediateValue,
  SignDAOutput,
  SignerNearBuilder,
} from "@ledgerhq/device-signer-kit-near";

import { DeviceActionsList } from "@/components/DeviceActionsView/DeviceActionsList";
import { type DeviceActionProps } from "@/components/DeviceActionsView/DeviceActionTester";
import { useDmk } from "@/providers/DeviceManagementKitProvider";

const DEFAULT_DERIVATION_PATH = "44'/397'/0'/0'/1";

export const SignerNearView: React.FC<{ sessionId: string }> = ({
  sessionId,
}) => {
  const dmk = useDmk();

  const signer = useMemo(
    () => new SignerNearBuilder({ dmk, sessionId }).build(),
    [dmk, sessionId],
  );

  const deviceModelId = dmk.getConnectedDevice({
    sessionId,
  }).modelId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deviceActions: DeviceActionProps<any, any, any, any>[] = useMemo(
    () => [
      {
        title: "Get public key",
        description:
          "Perform all the actions necessary to get an near public key from the device",
        executeDeviceAction: (args, inspect) => {
          return signer.getPublicKey(args, inspect);
        },
        deviceModelId,
        initialValues: {
          derivationPath: DEFAULT_DERIVATION_PATH,
          checkOnDevice: true,
        },
      } satisfies DeviceActionProps<
        GetPublicKeyDAOutput,
        {
          derivationPath: string;
          checkOnDevice: boolean;
        },
        GetPublicKeyDAError,
        GetPublicKeyDAIntermediateValue
      >,
      {
        title: "Get wallet id",
        description:
          "Perform all the actions necessary to get a near wallet id from the device",
        executeDeviceAction: (args, inspect) => {
          return signer.getWalletId(args, inspect);
        },
        deviceModelId,
        initialValues: {
          derivationPath: DEFAULT_DERIVATION_PATH,
          checkOnDevice: true,
        },
      } satisfies DeviceActionProps<
        GetWalletIdDAOutput,
        {
          derivationPath: string;
          checkOnDevice: boolean;
        },
        GetWalletIdDAError,
        GetWalletIdDAIntermediateValue
      >,
      {
        title: "Get version",
        description:
          "Perform all the actions necessary to get a near wallet app version from the device",
        executeDeviceAction: (inspect) => {
          return signer.getVersion(inspect);
        },
        deviceModelId,
        initialValues: undefined,
      } satisfies DeviceActionProps<
        GetVersionDAOutput,
        undefined,
        GetVersionDAError,
        GetVersionDAIntermediateValue
      >,
      {
        title: "Sign message",
        description:
          "Perform all the actions necessary sign a message from the device",
        executeDeviceAction: (args, inspect) => {
          return signer.signMessage(args, inspect);
        },
        deviceModelId,
        initialValues: {
          message: "",
          derivationPath: DEFAULT_DERIVATION_PATH,
        },
      } satisfies DeviceActionProps<
        SignDAOutput,
        {
          message: string;
          derivationPath: string;
        },
        SignDAError,
        SignDAIntermediateValue
      >,
    ],
    [deviceModelId, signer],
  );

  return (
    <DeviceActionsList title="Keyring Near" deviceActions={deviceActions} />
  );
};
