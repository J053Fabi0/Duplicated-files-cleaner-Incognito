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
    // If it has a fromNodeIndex or fromPath, then it's already complete.
    if ("fromNodeIndex" in constants.instructions[0] || "fromPath" in constants.instructions[0])
      return constants.instructions as Instruction[];

    // This is for the case where you want to get the most updated node in toNodesIndex and set it
    // as the fromNodeIndex.
    const instructions: Instruction[] = [];
    for (const instruction of constants.instructions as InstructionIncomplete[]) {
      // The nodes which are NOT going to be skipped
      const finalNodes = instruction.toNodesIndex.filter((nodeIndex) => nodesStatus[nodeIndex].skip === false);

      // At least two nodes are required.
      if (finalNodes.length < 2) continue;

      const totalFilesForNodes = finalNodes.reduce((obj, nodeIndex) => {
        obj[nodeIndex] = getNumberOfFiles(
          `${constants.homePath}/node_data_${nodeIndex}/mainnet/block/${instruction.shardName}`
        );
        return obj;
      }, {} as Record<string, number>);

      let mostUpdatedNode = -1;
      for (const nodeIndex of finalNodes)
        if (mostUpdatedNode === -1 || totalFilesForNodes[nodeIndex] > totalFilesForNodes[mostUpdatedNode])
          mostUpdatedNode = nodeIndex;

      instructions.push({
        shardName: instruction.shardName,
        fromNodeIndex: mostUpdatedNode,
        toNodesIndex: finalNodes.filter((nodeIndex) => nodeIndex !== mostUpdatedNode),
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
