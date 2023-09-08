export type ValidatorPublicKeys = Record<number | string, string>;

export default interface Constants {
  homePath: string;
  filesToCopy?: number;
  dockerIndexes: number[];
  minFilesToConsiderShard?: number;
}
