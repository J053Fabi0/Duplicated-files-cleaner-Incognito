export type ValidatorPublicKeys = Record<number | string, string>;

export default interface Constants {
  homePath: string;
  filesToStrip?: number;
  dockerIndexes: number[];
  minFilesToConsiderShard?: number;
}
