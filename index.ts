import run from "./run/run.ts";
import constants from "./constants.ts";
import { df } from "./utils/commands.ts";
import { ShardsNames } from "./types/shards.type.ts";
import DuplicatedFilesCleaner from "./DuplicatedFilesCleaner.ts";

const { fileSystem } = constants;

// if --help or -h is passed, show the help message
if (Deno.args.includes("--help") || Deno.args.includes("-h")) {
  console.log("Usage to remove duplicated files:");
  console.log("    deno task run");

  console.log("\nUsage to copy shards:");
  console.log("    deno task run copy [fromNodeIndex] [toNodeIndex] [...shards=[beacon]]");

  console.log("\nUsage to get nodes' shards info:");
  console.log("    deno task run info [...nodeIndexes=all]");

  console.log("\nUsage to move shards:");
  console.log("    deno task run move [fromNodeIndex] [toNodeIndex] [...shards=[beacon]]");

  Deno.exit();
}

const firstData = fileSystem ? await df(["-h", fileSystem, "--output=used,avail,pcent"]) : "";

const duplicatedFilesCleaner = new DuplicatedFilesCleaner(constants);

switch (Deno.args[0]) {
  case "info": {
    const nodes = Deno.args.length >= 2 ? Deno.args.slice(1) : duplicatedFilesCleaner.allNodes;
    const info = await duplicatedFilesCleaner.getInfo(nodes);

    for (const node of nodes) {
      console.group(`\nNode ${node}:`);
      console.table(info[node]);
      console.groupEnd();
    }

    break;
  }

  case "move": {
    await duplicatedFilesCleaner.move(Deno.args[1], Deno.args[2], Deno.args.slice(3) as ShardsNames[]);
    break;
  }

  case "copy": {
    const [, from = "", to = "", ...shards] = Deno.args;

    if (shards.length === 0) shards.push("beacon");

    if (from && to) await duplicatedFilesCleaner.copyData({ from, to, shards: shards as ShardsNames[] });
    else console.error("Missing from and/or to node indexes.");
    break;
  }

  default:
    await run();
}

if (fileSystem)
  console.log("\n", firstData, "\n", (await df(["-h", fileSystem, "--output=used,avail,pcent"])).slice(1));
