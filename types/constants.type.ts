export type ValidatorPublicKeys = Record<number | string, string>;

export default interface Constants {
  homePath: string;
  fileSystem?: string;
  dockerIndexes: number[];
  minFilesToConsiderShard?: number;
  validatorPublicKeys?: ValidatorPublicKeys;
}
