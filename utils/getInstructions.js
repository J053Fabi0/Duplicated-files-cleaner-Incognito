const { nodesDB } = require("../db/collections/collections");
const checkIfAllShardsHaveSeed = require("./checkIfAllShardsHaveSeed");
const checkIfConstantsHasChanged = require("./checkIfConstantsHaveChanged");

module.exports = async () => {
  await checkIfConstantsHasChanged();
  await checkIfAllShardsHaveSeed();

  const instructions = [];
  for (let i = 0; i <= 7; i++) {
    const seed = nodesDB.findOne({ shardID: i, shardSeed: true });
    if (!seed) continue;

    instructions.push({
      shardName: "shard" + i,
      fromNodeIndex: seed.index,
      toNodesIndex: nodesDB.find({ shardID: i, shardSeed: false }).map(({ index }) => index),
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
};
