import axiod from "axiod";
import Shards, { ShardsStr } from "../types/shards.type.ts";
import { nodesDB } from "../db/collections/collections.ts";

export default async function checkIfAllShardsHaveSeed() {
  const allNodes = nodesDB.find({});
  const shards: Record<Shards, typeof allNodes> = {
    ...{ 0: [], 1: [], 2: [], 3: [] },
    ...{ 4: [], 5: [], 6: [], 7: [] },
  };
  for (const node of allNodes) shards[node.shardID].push(node);

  for (const [shardID, nodes] of Object.entries(shards) as [ShardsStr, typeof allNodes][]) {
    // If there is only one node in this shard, there is no need to make it a seed.
    if (nodes.length <= 1) continue;

    const seed = nodesDB.find({ shardID: +shardID as Shards, shardSeed: true }) || [];
    // If there are no seeds, see if any of the nodes is in sync with the shard and make it a seed.
    if (seed.length === 0) {
      for (const { validatorPublicKey } of nodes)
        if (await getIfShardIsSync(validatorPublicKey, +shardID as Shards)) {
          nodesDB.findOne({ validatorPublicKey })!.shardSeed = true;
          break;
        }
    } else if (seed.length >= 2) {
      // If there is more than 1 seed, narrow them to 1.
      for (let i = 1; i < seed.length; i++)
        nodesDB.findOne({ validatorPublicKey: seed[i].validatorPublicKey })!.shardSeed = false;
    }
  }

  // Now check for the beacon seed
  const beaconSeed = nodesDB.find({ beaconSeed: true });
  if (beaconSeed.length === 0) {
    // If there is none, asign one.
    for (const { validatorPublicKey } of allNodes)
      if (await getIfShardIsSync(validatorPublicKey, -1)) {
        nodesDB.findOne({ validatorPublicKey })!.beaconSeed = true;
        break;
      }
  } else if (beaconSeed.length >= 2) {
    // If there are more than 1 seed, narrow them to 1.
    for (let i = 1; i < beaconSeed.length; i++)
      nodesDB.findOne({ validatorPublicKey: beaconSeed[i].validatorPublicKey })!.beaconSeed = false;
  }
}

const getIfShardIsSync = async (validatorPublicKey: string, shardID: Shards | -1) => {
  const { SyncState } = (
    await axiod.post("https://monitor.incognito.org/pubkeystat/stat", { mpk: validatorPublicKey })
  ).data[0];

  // If the shard is the beacon, then either shard syncing or latest will mean it is fully synced.
  return shardID === -1 ? SyncState === "SHARD SYNCING" || SyncState === "LATEST" : SyncState === "LATEST";
};
