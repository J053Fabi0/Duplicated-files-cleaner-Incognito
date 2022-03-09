const axios = require("axios");
const { nodesDB } = require("../db/collections/collections");

async function checkIfAllShardsHaveSeed() {
  const allNodes = nodesDB.find({});
  let shards = {};
  for (const node of allNodes) {
    const { shardID } = node;
    shards[shardID] = !shards[shardID] ? [node] : [...shards[shardID], node];
  }
  shards = Object.entries(shards);

  for (const [shardID, nodes] of shards) {
    // If there is only one node in this shard, there is no need to make it a seed.
    if (nodes.length <= 1) continue;

    const seed = nodesDB.find({ shardID: +shardID, shardSeed: true }) || [];
    // If there are no seeds, see if any of the nodes is in sync with the shard and make it a seed.
    if (seed.length === 0) {
      for (const { validatorPublicKey } of nodes)
        if (await getIfShardIsSync(validatorPublicKey, shardID)) {
          nodesDB.findOne({ validatorPublicKey }).shardSeed = true;
          break;
        }
    } else if (seed.length >= 2) {
      // If there is more than 1 seed, narrow them to 1.
      for (let i = 1; i < seed.length; i++)
        nodesDB.findOne({ validatorPublicKey: seed[i].validatorPublicKey }).shardSeed = false;
    }
  }

  // Now check for the beacon seed
  const beaconSeed = nodesDB.find({ beaconSeed: true });
  if (beaconSeed.length === 0) {
    // If there is none, asign one.
    for (const { validatorPublicKey } of allNodes)
      if (await getIfShardIsSync(validatorPublicKey, -1)) {
        nodesDB.findOne({ validatorPublicKey }).beaconSeed = true;
        break;
      }
  } else if (beaconSeed.length >= 2) {
    // If there are more than 1 seed, narrow them to 1.
    for (let i = 1; i < beaconSeed.length; i++)
      nodesDB.findOne({ validatorPublicKey: beaconSeed[i].validatorPublicKey }).beaconSeed = false;
  }
}

const getIfShardIsSync = async (validatorPublicKey, shardID) =>
  shardID === -1
    ? +(await axios.post("https://monitor.incognito.org/pubkeystat/sync", { mpk: validatorPublicKey })).data.Beacon
        .IsSync
    : +(await axios.post("https://monitor.incognito.org/pubkeystat/sync", { mpk: validatorPublicKey })).data.Shard[
        shardID
      ].IsSync;

module.exports = checkIfAllShardsHaveSeed;
