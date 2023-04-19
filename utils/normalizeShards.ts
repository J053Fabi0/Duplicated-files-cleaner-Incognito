import ShardsNumbers, { ShardsNames, ShardsStr } from "../types/shards.type.ts";

const shardNumberRegex = /^[0-7]$/;
const shardsFullNameRegex = /^shard[0-7]|beacon$/;

/**
 * Normalize a shard than is a number or a single digit string into the fullname of the shard.
 * @param shard The shard to normalize.
 * @returns The normalized shard.
 */
export function normalizeShard(shard: ShardsStr | ShardsNumbers | ShardsNames) {
  const normShard = shardNumberRegex.test(typeof shard === "number" ? `${shard}` : shard)
    ? (`shard${shard}` as ShardsNames)
    : (shard.toString().toLowerCase() as "beacon");
  if (shardsFullNameRegex.test(normShard) === false) throw new Error(`Invalid shard: ${normShard}`);

  return normShard;
}

/**
 * Normalize shards than are a number of a single digit string into the fullname of the shard.
 * @param shards The shards to normalize.
 * @returns The normalized shards.
 */
export default function normalizeShards(shards: (ShardsStr | ShardsNumbers | ShardsNames)[]): ShardsNames[] {
  return shards.map(normalizeShard);
}
