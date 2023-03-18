import run from "./run/run.ts";
import copyData from "./copyData.ts";
import constants from "./constants.ts";
import { df } from "./utils/commands.ts";

const { fileSystem } = constants;

// if --help or -h is passed, show the help message
if (Deno.args.includes("--help") || Deno.args.includes("-h")) {
  console.log(`Usage: deno task run index.ts`);
  console.log(`Usage to copy files: deno task run index.ts [fromNodeIndex] [toNodeIndex] [shard=beacon]`);
  Deno.exit();
}

const [from = "", to = "", ...shards] = Deno.args;
if (shards.length === 0) shards.push("beacon");

const firstData = fileSystem ? await df(["-h", fileSystem, "--output=used,avail,pcent"]) : "";

if (from && to) {
  for (const shard of shards) {
    if (/^(beacon|shard[0-7]|[0-7])$/i.test(shard) === false) {
      console.log(`Invalid shard: ${shard}`);
      continue;
    }

    const normalizedShard = shard.length === 1 ? `shard${shard}` : shard.toLocaleLowerCase();
    console.log(`Moving ${normalizedShard} files from ${from} to ${to}`);
    await copyData(from, to, normalizedShard);
    console.log();
  }
}
//
else await run();

if (fileSystem)
  console.log("\n", firstData, "\n", (await df(["-h", fileSystem, "--output=used,avail,pcent"])).slice(1));
