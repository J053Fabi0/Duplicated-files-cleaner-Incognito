import run from "./run/run.ts";
import copyData from "./copyData.ts";
import constants from "./constants.ts";
import { df, dockerPs } from "./utils/commands.ts";
import getFilesOfNodes from "./utils/getFilesOfNodes.ts";

const { fileSystem } = constants;

// if --help or -h is passed, show the help message
if (Deno.args.includes("--help") || Deno.args.includes("-h")) {
  console.log(`Usage: deno task run index.ts`);
  console.log(`Usage to copy files: deno task run index.ts [fromNodeIndex] [toNodeIndex] [shard=beacon]`);
  console.log("Usage to get nodes' info: deno task run info");
  Deno.exit();
}

if (Deno.args[0] === "info") {
  const dockerStatus = await dockerPs();
  const nodes = Object.keys(dockerStatus).map(Number);
  const filesOfNodes = await getFilesOfNodes();

  const shards = Object.keys(filesOfNodes);

  for (const node of nodes) {
    console.group(`\nNode ${node}:`);
    const info = shards.reduce((obj, shard) => ((obj[shard] = filesOfNodes[shard][node].length), obj), {
      docker: dockerStatus[node],
    } as Record<string, number | string>);
    console.table(info);
    console.groupEnd();
  }
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
