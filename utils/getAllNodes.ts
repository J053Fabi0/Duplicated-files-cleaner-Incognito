import constants from "../constants.ts";

const { instructions } = constants;

let allNodes: Set<number> | undefined = undefined;

/**
 * @returns A set of all nodes in the instructions.
 */
export default function getAllNodes() {
  if (allNodes) return allNodes;

  allNodes = instructions.reduce((set, i) => {
    for (const node of i.nodes) set.add(node);
    return set;
  }, new Set<number>());

  return allNodes;
}
