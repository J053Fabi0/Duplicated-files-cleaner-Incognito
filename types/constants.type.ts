import { ShardsNames } from "./shards.type.ts";

export interface Instruction {
  shardName: ShardsNames;
  nodes: number[];
}

export type ValidatorPublicKeys = Record<number | string, string>;

export default interface Constants {
  homePath: string;
  fileSystem?: string;
  storageFolder: string;
  instructions: Instruction[];
  filesToStripIfOnline: number;
  filesToStripIfOffline: number;
  minFilesToConsiderShard: number;
  validatorPublicKeys?: ValidatorPublicKeys;
}
