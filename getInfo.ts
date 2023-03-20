import { dockerPs } from "./utils/commands.ts";
import { ShardsNames, shardsNames } from "./types/shards.type.ts";
import getFilesOfNodes from "./utils/getFilesOfNodes.ts";

type Info = Record<ShardsNames | "docker", number | string>;

export default async function getInfo(nodes: (string | number)[] | Set<string | number> = []) {
  const dockerStatus = await dockerPs();
  const filesOfNodes = await getFilesOfNodes({ allShards: true, strip: false });

  const nodesInfo: Record<string, Info> = {};

  for (const node of nodes) {
    nodesInfo[node] = shardsNames.reduce(
      (obj, shard) => {
        if (filesOfNodes[shard][node].length >= 30) obj[shard] = filesOfNodes[shard][node].length;
        return obj;
      },
      {
        docker: dockerStatus[node],
      } as Info
    );
  }

  return nodesInfo;
}
