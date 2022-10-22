import Shards from "../types/shards.type.ts";
import { nodesDB } from "../db/collections/collections.ts";
import checkIfAllShardsHaveSeed from "./checkIfAllShardsHaveSeed.ts";
import checkIfConstantsHaveChanged from "./checkIfConstantsHaveChanged.ts";

export default async function getInstructions() {
  await checkIfConstantsHaveChanged();
  await checkIfAllShardsHaveSeed();

  const instructions = [];
  for (let i = 0; i <= 7; i++) {
    const seed = nodesDB.findOne({ shardID: i as Shards, shardSeed: true });
    if (!seed) continue;

    instructions.push({
      shardName: "shard" + i,
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
