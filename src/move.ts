import { join } from "../deps.ts";
import normalizeShards from "../utils/normalizeShards.ts";
import DuplicatedFilesCleaner from "./DuplicatedFilesCleaner.ts";
import ShardsNumbers, { ShardsNames, ShardsStr } from "../types/shards.type.ts";

/**
 * Move a shard from one node to another.
 * @param from The index of the node to copy from
 * @param to The index of the node to copy to
 * @param shards The shards to copy. Defaults to ["beacon"]
 */
export default async function move(
  this: DuplicatedFilesCleaner,
  from: string | number,
  to: string | number,
  shards: (ShardsStr | ShardsNumbers | ShardsNames)[] = ["beacon"]
) {
  const normalizedShards = normalizeShards(shards);
  if (normalizedShards.length === 0) normalizedShards.push("beacon");

  for (const shard of normalizedShards) {
    console.log(`Moving ${shard} from node ${from} to node ${to}.`);

    const fromShardPath = join(this.homePath, `/node_data_${from}/mainnet/block/${shard}`);
    const toShardPath = join(this.homePath, `/node_data_${to}/mainnet/block/${shard}`);

    // remove the destination shard, if it exists
    await Deno.remove(toShardPath, { recursive: true }).catch(() => {});

    // move the shard
    try {
      Deno.renameSync(fromShardPath, toShardPath);
    } catch (e) {
      console.error(e);
    }
  }
}
