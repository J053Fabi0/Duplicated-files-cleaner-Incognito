import constants from "../constants.ts";
import { Instruction, InstructionIncomplete } from "../types/constants.type.ts";
import { nodesDB } from "../db/collections/collections.ts";
import Shards, { ShardsNames } from "../types/shards.type.ts";
import checkIfAllShardsHaveSeed from "./checkIfAllShardsHaveSeed.ts";
import checkIfConstantsHaveChanged from "./checkIfConstantsHaveChanged.ts";
import { NodesStatus } from "./getNodesStatus.ts";
import getNumberOfFiles from "./getNumberOfFiles.ts";

export default async function getInstructions(nodesStatus: NodesStatus) {
  // If the instructions are already defined in the constants file, then just return them.
  if ("instructions" in constants && constants.instructions instanceof Array) {
    const instructions: Instruction[] = [];
    for (const instruction of constants.instructions) {
      // If it has a fromNodeIndex or fromPath, then it's already complete.
      if ("fromNodeIndex" in instruction || "fromPath" in instruction) instructions.push(instruction);

      // This is for the case where you want to get the most updated node in toNodesIndex and set it
      // as the fromNodeIndex.

      // Separate the nodes which are NOT going to be skipped and the ones that are.
      const activeNodes = instruction.toNodesIndex.filter((nodeIndex) => nodesStatus[nodeIndex].skip === false);
      const skippedNodes = instruction.toNodesIndex.filter((nodeIndex) => nodesStatus[nodeIndex].skip === true);

      const totalFilesPerNode = activeNodes.reduce((obj, nodeIndex) => {
        obj[nodeIndex] = getNumberOfFiles(
          `${constants.homePath}/node_data_${nodeIndex}/mainnet/block/${instruction.shardName}`
        );
        return obj;
      }, {} as Record<string, number>);

      let mostUpdatedNode = -1;
      for (const nodeIndex of activeNodes)
        if (mostUpdatedNode === -1 || totalFilesPerNode[nodeIndex] > totalFilesPerNode[mostUpdatedNode])
          mostUpdatedNode = nodeIndex;

      instructions.push({
        shardName: instruction.shardName,
        fromNodeIndex: mostUpdatedNode,
        toNodesIndex: [
          ...activeNodes.filter((nodeIndex) => nodeIndex !== mostUpdatedNode),
          ...skippedNodes,
        ].sort(),
      });
    }

    return instructions;
  }

  const instructions: Instruction[] = [];

  await checkIfConstantsHaveChanged();
  await checkIfAllShardsHaveSeed();

  for (let i = 0; i <= 7; i++) {
    const seed = nodesDB.findOne({ shardID: i as Shards, shardSeed: true });
    if (!seed) continue;

    instructions.push({
      shardName: ("shard" + i) as ShardsNames,
      fromNodeIndex: seed.index,
      toNodesIndex: nodesDB.find({ shardID: i as Shards, shardSeed: false }).map(({ index }) => index),
    });
  }

  const beaconSeed = nodesDB.findOne({ beaconSeed: true });
  if (beaconSeed)
    instructions.push({
      shardName: "beacon",
      fromNodeIndex: beaconSeed.index,
      toNodesIndex: nodesDB.find({ beaconSeed: false }).map(({ index }) => index),
    });

  return instructions;
}
