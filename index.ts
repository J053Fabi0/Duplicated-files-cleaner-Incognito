import { df } from "./utils/commands.ts";
import { ShardsNames } from "./types/shards.type.ts";
import DuplicatedFilesCleaner from "./src/DuplicatedFilesCleaner.ts";

// if --help or -h is passed, show the help message
if (Deno.args.includes("--help") || Deno.args.includes("-h") || Deno.args.includes("help")) {
  console.log("Remove duplicated files:");
  console.log("    deno task run");

  console.log("\nCopy shards:");
  console.log("    deno task run copy [fromNodeIndex] [toNodeIndex] [...shards=[beacon]]");

  console.log("\nGet nodes' shards info:");
  console.log("    deno task run info [...nodeIndexes=all]");

  console.log("\nMove shards:");
  console.log("    deno task run move [fromNodeIndex] [toNodeIndex] [...shards=[beacon]]");

  Deno.exit();
}

if (
  await Deno.stat("./constants.ts")
    .then(() => true)
    .catch(() => false)
) {
  const constants = (await import("./constants.ts")).default;
  const { fileSystem } = constants;

  const firstData = fileSystem ? await df(["-h", fileSystem, "--output=used,avail,pcent"]) : "";

  const duplicatedFilesCleaner = new DuplicatedFilesCleaner(constants);

  switch (Deno.args[0]) {
    case "info": {
      const nodes = Deno.args.length >= 2 ? Deno.args.slice(1) : duplicatedFilesCleaner.dockerIndexes;
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
      await duplicatedFilesCleaner.run();
  }

  if (fileSystem)
    console.log("\n", firstData, "\n", (await df(["-h", fileSystem, "--output=used,avail,pcent"])).slice(1));
}
