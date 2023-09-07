import move from "./move.ts";
import getInfo from "./getInfo.ts";
import copyData from "./copyData.ts";
import Constants from "../types/constants.type.ts";
import getFilesOfNodes from "../utils/getFilesOfNodes.ts";

export default class DuplicatedFilesCleaner {
  homePath: string;
  dockerIndexes: number[];
  minFilesToConsiderShard: number;

  constructor({
    homePath,
    dockerIndexes,
    minFilesToConsiderShard = 30,
  }: Omit<Constants, "fileSystem" | "validatorPublicKeys">) {
    this.homePath = homePath;
    this.dockerIndexes = dockerIndexes;
    this.minFilesToConsiderShard = minFilesToConsiderShard;
  }

  /**
   * Get information of nodes
   * @param nodes The nodes to get the info from. If not provided, it will get the info from all nodes. Docker indexes.
   * @returns An object with the first key being the node index and the second key being the shard name. The value is the number of files in the shards that have more than 30 files. It also includes the docker status of the node.
   */
  declare getInfo: OmitThisParameter<typeof getInfo>;

  /**
   * Get the nodes' files for each shard.
   * @param strip Whether to strip the files or not according to filesToStripIfOnline and filesToStripIfOffline or not. Default is true.
   * @param nodes The docker indexes to get the files from. Default is all nodes.
   * @param useCache Use the cache if it exists. Default is false.
   * @param allShards Get the files of all shards possible, not just the ones in the instructions. Default is false.
   * @return First key is the shard name, second key is the docker index, and the value is an array of files.
   */
  declare getFilesOfNodes: OmitThisParameter<typeof getFilesOfNodes>;

  /**
   * Move a shard from one node to another.
   * @param from The index of the node to copy from
   * @param to The index of the node to copy to
   * @param shards The shards to copy. Defaults to ["beacon"]
   */
  declare move: OmitThisParameter<typeof move>;

  /**
   * Copy a shard from one node to another.
   * @param from The index of the node to copy from
   * @param to The index of the node to copy to
   * @param shards The shards to copy. Defaults to ["beacon"]
   * @param logProgressBar Whether to log a progress bar. Defaults to false.
   */
  declare copyData: OmitThisParameter<typeof copyData>;
}

DuplicatedFilesCleaner.prototype.getInfo = getInfo;
DuplicatedFilesCleaner.prototype.getFilesOfNodes = getFilesOfNodes;
DuplicatedFilesCleaner.prototype.move = move;
DuplicatedFilesCleaner.prototype.copyData = copyData;
