import constants from "../constants.ts";
import { Instruction } from "../types/constants.type.ts";
import { nodesDB } from "../db/collections/collections.ts";
import Shards, { ShardsNames } from "../types/shards.type.ts";
import checkIfAllShardsHaveSeed from "./checkIfAllShardsHaveSeed.ts";
import checkIfConstantsHaveChanged from "./checkIfConstantsHaveChanged.ts";

export default async function getInstructions() {
  if ("instructions" in constants && constants.instructions instanceof Array) return constants.instructions;

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
