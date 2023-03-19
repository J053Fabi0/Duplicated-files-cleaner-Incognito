import constants from "../constants.ts";

const { instructions } = constants;

/**
 * @returns A set of all nodes in the instructions.
 */
export default function getAllNodes() {
  return instructions.reduce((set, i) => {
    for (const node of i.nodes) set.add(node);
    return set;
  }, new Set<number>());
}
