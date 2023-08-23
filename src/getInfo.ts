import { dockerPs, DockerInfo } from "../utils/commands.ts";
import DuplicatedFilesCleaner from "./DuplicatedFilesCleaner.ts";
import { ShardsNames, shardsNames } from "../types/shards.type.ts";

export type Info = Partial<Record<ShardsNames, number>> & { docker: DockerInfo };

export default async function getInfo(
  this: DuplicatedFilesCleaner,
  nodes: (string | number)[] | Set<string | number> = this.dockerIndexes
) {
  const dockerStatus = await dockerPs(nodes instanceof Set ? [...nodes] : nodes);

  const filesOfNodes = this.getFilesOfNodes({ nodes });

  const nodesInfo: Record<string, Info> = {};

  for (const node of nodes)
    nodesInfo[node] = shardsNames.reduce(
      (obj, shard) => {
        if (filesOfNodes[shard][node].length >= this.minFilesToConsiderShard)
          obj[shard] = filesOfNodes[shard][node].length;
        return obj;
      },
      { docker: dockerStatus[node] } as Info
    );

  return nodesInfo;
}
