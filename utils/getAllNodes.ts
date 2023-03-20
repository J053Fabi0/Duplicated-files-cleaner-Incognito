import { Instruction } from "../types/constants.type.ts";

/**
 * @returns A set of all nodes in the instructions.
 */
export default function getAllNodes(instructions: Instruction[]) {
  return instructions.reduce((set, i) => {
    for (const node of i.nodes) set.add(node);
    return set;
  }, new Set<number>());
}
