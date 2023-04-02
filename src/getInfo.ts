import { dockerPs, DockerStatus } from "../utils/commands.ts";
import DuplicatedFilesCleaner from "./DuplicatedFilesCleaner.ts";
import { ShardsNames, shardsNames } from "../types/shards.type.ts";

export type Info = Record<ShardsNames, number> & { docker: DockerStatus };

export default async function getInfo(
  this: DuplicatedFilesCleaner,
  nodes: (string | number)[] | Set<string | number> = this.usedNodes
) {
  const dockerStatus = await dockerPs(nodes instanceof Set ? [...nodes] : nodes);

  const filesOfNodes = await this.getFilesOfNodes({
    nodes,
    strip: false,
    allShards: true,
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
