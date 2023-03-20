import { dockerPs } from "./utils/commands.ts";
import getFilesOfNodes from "./utils/getFilesOfNodes.ts";
import { ShardsNames, shardsNames } from "./types/shards.type.ts";

type Info = Record<ShardsNames, number> & { docker: "ONLINE" | "OFFLINE" };

/**
 * Get information of nodes
 * @param homePath The home path of the nodes. Usually /home/incognito
 * @param nodes The nodes to get info from.
 * @returns An object with the first key being the node index and the second key being the shard name. The value is the number of files in the shards that have more than 30 files. It also includes the docker status of the node.
 */
export default async function getInfo(homePath: string, nodes: (string | number)[] | Set<string | number> = []) {
  const dockerStatus = await dockerPs(nodes instanceof Set ? [...nodes] : nodes);
  const filesOfNodes = await getFilesOfNodes({
    homePath,
    strip: false,
    allShards: true,
    nodes: nodes instanceof Set ? [...nodes] : nodes,
  });

  const nodesInfo: Record<string, Info> = {};

  for (const node of nodes)
    nodesInfo[node] = shardsNames.reduce(
      (obj, shard) => {
        if (filesOfNodes[shard][node].length >= 30) obj[shard] = filesOfNodes[shard][node].length;
        return obj;
      },
      { docker: dockerStatus[node] } as Info
    );

  return nodesInfo;
}
