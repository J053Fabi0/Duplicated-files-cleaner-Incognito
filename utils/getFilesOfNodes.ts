import { join } from "../deps.ts";
import { dockerPs } from "../utils/commands.ts";
import { shardsNames } from "../types/shards.type.ts";
import getFiles, { LDBFile } from "../utils/getFiles.ts";
import DuplicatedFilesCleaner from "../DuplicatedFilesCleaner.ts";

// const { instructions, homePath, filesToStripIfOnline, filesToStripIfOffline } = constants;

let cached = false;
const filesOfNodes: Record<string, Record<string, LDBFile[]>> = {};

export interface GetFilesOfNodesOptions {
  strip?: boolean;
  allShards?: boolean;
  ignoreCache?: boolean;
  nodes?: (string | number)[] | Set<string | number>;
}

export default async function getFilesOfNodes(
  this: DuplicatedFilesCleaner,
  { strip = true, allShards = false, ignoreCache = false, nodes = this.allNodes }: GetFilesOfNodesOptions
) {
  if (cached && ignoreCache === false) return filesOfNodes;

  const dockerStatuses = await dockerPs();

  const newInstructions = allShards
    ? shardsNames.map((shardName) => ({ shardName, nodes: nodes }))
    : this.instructions;

  for (const { shardName, nodes } of newInstructions) {
    filesOfNodes[shardName] = {};
    for (const node of nodes) {
      const stripValue = strip
        ? // strip only if the node is online and filesToStripIfOnline is positive
          dockerStatuses[node] === "ONLINE" && this.filesToStripIfOnline >= 0
          ? this.filesToStripIfOnline
          : // or if the node is offline and filesToStripIfOffline is positive
          dockerStatuses[node] === "OFFLINE" && this.filesToStripIfOffline >= 0
          ? this.filesToStripIfOffline
          : 0
        : 0;
      filesOfNodes[shardName][node] = getFiles(
        join(this.homePath, `/node_data_${node}/mainnet/block/${shardName}`)
      ).slice(stripValue);
    }
  }

  cached = true;
  return filesOfNodes;
}
