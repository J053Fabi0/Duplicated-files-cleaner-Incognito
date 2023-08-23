import { join } from "../deps.ts";
import getFiles, { LDBFile } from "../utils/getFiles.ts";
import { shardsNames, ShardsNames } from "../types/shards.type.ts";
import DuplicatedFilesCleaner from "../src/DuplicatedFilesCleaner.ts";

let cached = false;
const filesOfNodes = {} as Record<ShardsNames, Record<string, LDBFile[]>>;

export default function getFilesOfNodes(
  this: DuplicatedFilesCleaner,
  { useCache = false, nodes = this.dockerIndexes as Set<number | string> | (number | string)[] } = {}
) {
  if (cached && useCache) return filesOfNodes;

  const newInstructions = shardsNames.map((shardName) => ({ shardName, nodes: nodes }));

  for (const { shardName, nodes } of newInstructions) {
    filesOfNodes[shardName] = {};
    for (const node of nodes) {
      filesOfNodes[shardName][node] = getFiles(
        join(this.homePath, `/node_data_${node}/mainnet/block/${shardName}`)
      );
    }
  }

  cached = true;
  return filesOfNodes;
}
