import { join } from "./deps.ts";
import getInfo from "./getInfo.ts";
import getFilesOfNodes from "./utils/getFilesOfNodes.ts";
import Constants, { Instruction, ValidatorPublicKeys } from "./types/constants.type.ts";
import move from "./move.ts";

export default class DuplicatedFilesCleaner {
  homePath: string;
  fileSystem?: string;
  storageFolder: string;
  instructions: Instruction[];
  filesToStripIfOnline: number;
  filesToStripIfOffline: number;
  validatorPublicKeys?: ValidatorPublicKeys;

  // These are not part of the constructor, they are calculated at initialization.
  allNodes: Set<number>;
  homeStoragePath: string;

  constructor({
    homePath,
    fileSystem,
    instructions,
    storageFolder,
    validatorPublicKeys,
    filesToStripIfOnline,
    filesToStripIfOffline,
  }: Constants) {
    this.homePath = homePath;
    this.fileSystem = fileSystem;
    this.instructions = instructions;
    this.storageFolder = storageFolder;
    this.validatorPublicKeys = validatorPublicKeys;
    this.filesToStripIfOnline = filesToStripIfOnline;
    this.filesToStripIfOffline = filesToStripIfOffline;

    this.homeStoragePath = join(this.homePath, this.storageFolder);
    this.allNodes = instructions.reduce((set, i) => {
      for (const node of i.nodes) set.add(node);
      return set;
    }, new Set<number>());
  }

  /**
   * Get information of nodes
   * @param nodes The nodes to get the info from. If not provided, it will get the info from all nodes.
   * @returns An object with the first key being the node index and the second key being the shard name. The value is the number of files in the shards that have more than 30 files. It also includes the docker status of the node.
   */
  declare getInfo: typeof getInfo;

  /**
   * Get the nodes' files for each shard.
   * @param strip Whether to strip the files or not according to filesToStripIfOnline and filesToStripIfOffline or not. Default is true.
   * @param nodes The nodes to get the files from. Default is all nodes.
   * @param ignoreCache Ignore the cache and get the files again. Default is false.
   * @param allShards Get the files of all shards possible, not just the ones in the instructions. Default is false.
   * @return First key is the shard name, second key is the node number, and the value is an array of files.
   */
  declare getFilesOfNodes: typeof getFilesOfNodes;

  /**
   * Move a shard from one node to another.
   * @param from The index of the node to copy from
   * @param to The index of the node to copy to
   * @param shards The shards to copy. Defaults to ["beacon"]
   */
  declare move: typeof move;
}

DuplicatedFilesCleaner.prototype.getInfo = getInfo;
DuplicatedFilesCleaner.prototype.getFilesOfNodes = getFilesOfNodes;
DuplicatedFilesCleaner.prototype.move = move;
