import { join } from "./deps.ts";
import constants from "./constants.ts";
import Shards, { ShardsNames, ShardsStr } from "./types/shards.type.ts";

const { homePath } = constants;

/**
 * @param from The index of the node to copy from
 * @param to The index of the node to copy to
 * @param shards The shards to copy. Defaults to ["beacon"]
 */
export default async function move(
  from: string | number,
  to: string | number,
  shards: (ShardsStr | Shards | ShardsNames)[] = ["beacon"]
) {
  // normalize shards
  const normShards = shards.map((s) =>
    /^[0-7]$/.test(`${s}`) ? `shard${s}` : s.toString().toLowerCase()
  ) as ShardsNames[];
  if (normShards.length === 0) normShards.push("beacon");

  for (const shard of normShards)
    if (/^shard[0-7]|beacon$/.test(shard) === false) throw new Error(`Invalid shard: ${shard}`);

  for (const shard of normShards) {
    console.log(`Moving ${shard} from node ${from} to node ${to}.`);

    const fromShardPath = join(homePath, `/node_data_${from}/mainnet/block/${shard}`);
    const toShardPath = join(homePath, `/node_data_${to}/mainnet/block/${shard}`);

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
