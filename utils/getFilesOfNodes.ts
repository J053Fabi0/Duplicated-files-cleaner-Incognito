import { join } from "../deps.ts";
import { dockerPs } from "../utils/commands.ts";
import { shardsNames } from "../types/shards.type.ts";
import getFiles, { LDBFile } from "../utils/getFiles.ts";
import DuplicatedFilesCleaner from "../src/DuplicatedFilesCleaner.ts";

let cached = false;
const filesOfNodes: Record<string, Record<string, LDBFile[]>> = {};

export default async function getFilesOfNodes(
  this: DuplicatedFilesCleaner,
  { strip = true, useCache = false, nodes = this.dockerIndexes as Set<number | string> | (number | string)[] } = {}
) {
  if (cached && useCache) return filesOfNodes;

  const dockerStatuses = await dockerPs(this.dockerIndexes, useCache);

  const newInstructions = shardsNames.map((shardName) => ({ shardName, nodes: nodes }));

  for (const { shardName, nodes } of newInstructions) {
    filesOfNodes[shardName] = {};
    for (const node of nodes) {
      const stripValue = strip
        ? // strip only if the node is online and filesToStripIfOnline is positive
          dockerStatuses[node].running && this.filesToStripIfOnline >= 0
          ? this.filesToStripIfOnline
          : // or if the node is offline and filesToStripIfOffline is positive
          !dockerStatuses[node].running && this.filesToStripIfOffline >= 0
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
