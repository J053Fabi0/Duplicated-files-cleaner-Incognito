import run from "./run/run.ts";

// if --help or -h is passed, show the help message
if (Deno.args.includes("--help") || Deno.args.includes("-h")) {
  console.log(`Usage: deno task run index.ts`);
  console.log(`Usage to copy files: deno task run index.ts [fromNodeIndex] [toNodeIndex] [shard=beacon]`);
  Deno.exit();
}

const [from = "", to = "", shard = "beacon"] = Deno.args;

if (from && to) {
  console.log(`Moving ${shard} files from ${from} to ${to}`);
} else await run();
