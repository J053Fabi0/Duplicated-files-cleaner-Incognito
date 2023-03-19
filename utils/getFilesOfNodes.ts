import { join } from "../deps.ts";
import constants from "../constants.ts";
import { dockerPs } from "../utils/commands.ts";
import getFiles, { LDBFile } from "../utils/getFiles.ts";

const { instructions, homePath, filesToStripIfOnline, filesToStripIfOffline } = constants;

let cached = false;
const filesOfNodes: Record<string, Record<string, LDBFile[]>> = {};

/**
 * Get the nodes' files for each shard.
 * @param ignoreCache Ignore the cache and get the files again.
 * @return First key is the shard name, second key is the node number, and the value is an array of files.
 */
export default async function getFilesOfNodes(ignoreCache = false) {
  if (cached && ignoreCache === false) return filesOfNodes;

  const dockerStatuses = await dockerPs();

  console.table(dockerStatuses);

  for (const { shardName, nodes } of instructions) {
    filesOfNodes[shardName] = {};
    for (const node of nodes)
      filesOfNodes[shardName][node] = getFiles(
        join(homePath, `/node_data_${node}/mainnet/block/${shardName}`)
      ).slice(
        // strip only if the node is online and filesToStripIfOnline is positive
        dockerStatuses[`inc_mainnet_${node}`] === "ONLINE" && filesToStripIfOnline >= 0
          ? filesToStripIfOnline
          : // or if the node is offline and filesToStripIfOffline is positive
          dockerStatuses[`inc_mainnet_${node}`] === "OFFLINE" && filesToStripIfOffline >= 0
          ? filesToStripIfOffline
          : 0
      );
  }

  cached = true;
  return filesOfNodes;
}
