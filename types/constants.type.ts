export type ValidatorPublicKeys = Record<number | string, string>;

export default interface Constants {
  homePath: string;
  fileSystem?: string;
  storageFolder: string;
  dockerIndexes: number[];
  filesToStripIfOnline: number;
  filesToStripIfOffline: number;
  minFilesToConsiderShard?: number;
  validatorPublicKeys?: ValidatorPublicKeys;
}
