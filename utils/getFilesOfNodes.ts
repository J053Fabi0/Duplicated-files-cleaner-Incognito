import { join } from "../deps.ts";
import constants from "../constants.ts";
import getAllNodes from "./getAllNodes.ts";
import { dockerPs } from "../utils/commands.ts";
import { shardsNames } from "../types/shards.type.ts";
import getFiles, { LDBFile } from "../utils/getFiles.ts";

const { instructions, homePath, filesToStripIfOnline, filesToStripIfOffline } = constants;

let cached = false;
const filesOfNodes: Record<string, Record<string, LDBFile[]>> = {};

/**
 * Get the nodes' files for each shard.
 * @param ignoreCache Ignore the cache and get the files again.
 * @param allShards Get the files of all shards, not just the ones in the instructions.
 * @return First key is the shard name, second key is the node number, and the value is an array of files.
 */
export default async function getFilesOfNodes(ignoreCache = false, allShards = false) {
  if (cached && ignoreCache === false) return filesOfNodes;

  const dockerStatuses = await dockerPs();

  const allNodes = getAllNodes();
  const newInstructions = allShards
    ? shardsNames.map((shardName) => ({ shardName, nodes: allNodes }))
    : instructions;

  for (const { shardName, nodes } of newInstructions) {
    filesOfNodes[shardName] = {};
    for (const node of nodes)
      filesOfNodes[shardName][node] = getFiles(
        join(homePath, `/node_data_${node}/mainnet/block/${shardName}`)
      ).slice(
        // strip only if the node is online and filesToStripIfOnline is positive
        dockerStatuses[node] === "ONLINE" && filesToStripIfOnline >= 0
          ? filesToStripIfOnline
          : // or if the node is offline and filesToStripIfOffline is positive
          dockerStatuses[node] === "OFFLINE" && filesToStripIfOffline >= 0
          ? filesToStripIfOffline
          : 0
      );
  }

  cached = true;
  return filesOfNodes;
}
