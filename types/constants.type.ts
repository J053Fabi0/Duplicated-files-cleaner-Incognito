import { ShardsNames } from "./shards.type.ts";

export interface InstructionIncomplete {
  shardName: ShardsNames;
  toNodesIndex: (keyof Constants["validatorPublicKeys"])[];
}
export interface InstructionFromNode extends InstructionIncomplete {
  fromNodeIndex: keyof Constants["validatorPublicKeys"];
}
export interface InstructionFromPath extends InstructionIncomplete {
  fromPath: string;
}
export type Instruction =
  | (InstructionIncomplete & InstructionFromNode)
  | (InstructionIncomplete & InstructionFromPath);

export type ValidatorPublicKeys = Record<number, string>;

export default interface Constants {
  homePath: string;
  extraDockers?: string[];
  instructions?: (Instruction | InstructionIncomplete)[];
  maxEpochsToNextEvent?: number;
  validatorPublicKeys: ValidatorPublicKeys;
}
