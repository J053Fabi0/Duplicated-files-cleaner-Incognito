import { ShardsNames } from "./shards.type.ts";

export interface Instruction {
  shardName: ShardsNames;
  nodes: (keyof Constants["validatorPublicKeys"])[];
}

export type ValidatorPublicKeys = Record<number | string, string>;

export default interface Constants {
  homePath: string;
  filesToStrip: number;
  storageFolder: string;
  instructions: Instruction[];
  validatorPublicKeys: ValidatorPublicKeys;
}
