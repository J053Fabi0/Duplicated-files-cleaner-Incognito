export type ValidatorPublicKeys = Record<number | string, string>;

export default interface Constants {
  homePath: string;
  dockerIndexes: number[];
  minFilesToConsiderShard?: number;
}
