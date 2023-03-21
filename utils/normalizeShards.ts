import ShardsNumbers, { ShardsNames, ShardsStr } from "../types/shards.type.ts";

const shardNumberRegex = /^[0-7]$/;
const shardsFullNameRegex = /^shard[0-7]|beacon$/;

/**
 * Normalize shards than are a number of a single digit string into the fullname of the shard.
 * @param shards The shards to normalize.
 * @returns The normalized shards.
 */
export default function normalizeShards(shards: (ShardsStr | ShardsNumbers | ShardsNames)[]): ShardsNames[] {
  const normShards = shards.map((s) =>
    shardNumberRegex.test(typeof s === "number" ? `${s}` : s) ? `shard${s}` : s.toString().toLowerCase()
  ) as ShardsNames[];
  if (normShards.length === 0) normShards.push("beacon");

  for (const shard of normShards)
    if (shardsFullNameRegex.test(shard) === false) throw new Error(`Invalid shard: ${shard}`);

  return normShards;
}
