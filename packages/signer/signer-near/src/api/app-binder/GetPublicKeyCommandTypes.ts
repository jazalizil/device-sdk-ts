export type GetPublicKeyCommandResponse = {
  readonly address: string;
};

export type GetPublicKeyCommandArgs = {
  readonly derivationPath: string;
  readonly checkOnDevice?: boolean;
};
