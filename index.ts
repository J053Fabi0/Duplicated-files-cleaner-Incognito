import move from "./move.ts";
import run from "./run/run.ts";
import getInfo from "./getInfo.ts";
import copyData from "./copyData.ts";
import constants from "./constants.ts";
import { df } from "./utils/commands.ts";
import getAllNodes from "./utils/getAllNodes.ts";
import { ShardsNames } from "./types/shards.type.ts";

const { fileSystem, instructions, homePath } = constants;

// if --help or -h is passed, show the help message
if (Deno.args.includes("--help") || Deno.args.includes("-h")) {
  console.log("Usage to remove duplicated files:");
  console.log("    deno task run");

  console.log("\nUsage to copy shards:");
  console.log("    deno task run [fromNodeIndex] [toNodeIndex] [...shards=[beacon]]");

  console.log("\nUsage to get nodes' shards info:");
  console.log("    deno task run info [...nodeIndexes=all]");

  console.log("\nUsage to move shards:");
  console.log("    deno task run move [fromNodeIndex] [toNodeIndex] [...shards=[beacon]]");

  Deno.exit();
}

if (Deno.args[0] === "info") {
  const nodes = Deno.args.slice(1).length ? Deno.args.slice(1) : getAllNodes(instructions);
  const info = await getInfo(homePath, nodes);

  for (const node of nodes) {
    console.group(`\nNode ${node}:`);
    console.table(info[node]);
    console.groupEnd();
  }

  Deno.exit();
}

if (Deno.args[0] === "move") {
  await move(Deno.args[1], Deno.args[2], Deno.args.slice(3) as ShardsNames[]);
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
