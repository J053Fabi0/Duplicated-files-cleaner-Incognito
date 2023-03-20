import Shards, { ShardsNames, ShardsStr } from "../types/shards.type.ts";

const shardNumberRegex = /^[0-7]$/;
const shardsFullNameRegex = /^shard[0-7]|beacon$/;

export default function normalizeShards(shards: (ShardsStr | Shards | ShardsNames)[]): ShardsNames[] {
  const normShards = shards.map((s) =>
    shardNumberRegex.test(typeof s === "number" ? `${s}` : s) ? `shard${s}` : s.toString().toLowerCase()
  ) as ShardsNames[];
  if (normShards.length === 0) normShards.push("beacon");

  for (const shard of normShards)
    if (shardsFullNameRegex.test(shard) === false) throw new Error(`Invalid shard: ${shard}`);

  return normShards;
}
