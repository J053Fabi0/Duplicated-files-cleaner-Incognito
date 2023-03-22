import move from "./move.ts";
import run from "./run/run.ts";
import { join } from "../deps.ts";
import getInfo from "./getInfo.ts";
import copyData from "./copyData.ts";
import { ShardsNames } from "../types/shards.type.ts";
import substituteFiles from "./run/substituteFiles.ts";
import getFilesOfNodes from "../utils/getFilesOfNodes.ts";
import getStorageFiles from "../utils/getStorageFiles.ts";
import deleteUnusedFiles from "./run/deleteUnusedFiles.ts";
import moveFilesToStorage from "./run/moveFilesToStorage.ts";
import Constants, { Instruction } from "../types/constants.type.ts";

export default class DuplicatedFilesCleaner {
  homePath: string;
  storageFolder: string;
  instructions: Instruction[];
  filesToStripIfOnline: number;
  filesToStripIfOffline: number;

  // They are calculated only once when they are called and then cached.
  #usedNodes: Set<number> | undefined = undefined;
  #homeStoragePath: string | undefined = undefined;
  #usedShards: ShardsNames[] | undefined = undefined;

  constructor({
    homePath,
    instructions,
    storageFolder,
    filesToStripIfOnline,
    filesToStripIfOffline,
  }: Omit<Constants, "fileSystem" | "validatorPublicKeys">) {
    this.homePath = homePath;
    this.instructions = instructions;
    this.storageFolder = storageFolder;
    this.filesToStripIfOnline = filesToStripIfOnline;
    this.filesToStripIfOffline = filesToStripIfOffline;
  }

  get homeStoragePath() {
    if (this.#homeStoragePath) return this.#homeStoragePath;
    return (this.#homeStoragePath = join(this.homePath, this.storageFolder));
  }

  get usedNodes() {
    if (this.#usedNodes) return this.#usedNodes;
    return (this.#usedNodes = this.instructions.reduce((set, i) => {
      for (const node of i.nodes) set.add(node);
      return set;
    }, new Set<number>()));
  }

  get usedShards() {
    if (this.#usedShards) return this.#usedShards;
    return (this.#usedShards = this.instructions.map((i) => i.shardName));
  }

  /**
   * Get information of nodes
   * @param nodes The nodes to get the info from. If not provided, it will get the info from all nodes.
   * @returns An object with the first key being the node index and the second key being the shard name. The value is the number of files in the shards that have more than 30 files. It also includes the docker status of the node.
   */
  declare getInfo: OmitThisParameter<typeof getInfo>;

  /**
   * Get the nodes' files for each shard.
   * @param strip Whether to strip the files or not according to filesToStripIfOnline and filesToStripIfOffline or not. Default is true.
   * @param nodes The nodes to get the files from. Default is all nodes.
   * @param useCache Use the cache if it exists. Default is false.
   * @param allShards Get the files of all shards possible, not just the ones in the instructions. Default is false.
   * @return First key is the shard name, second key is the node number, and the value is an array of files.
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

  /** Runs the whole process of deleting duplicated files. */
  declare run: OmitThisParameter<typeof run>;

  /**
   * Move the files of the nodes to the storage folder using hard links. No changes are made to the nodes.
   * @param useCache Use the cache if it exists. Default is false.
   */
  declare moveFilesToStorage: OmitThisParameter<typeof moveFilesToStorage>;

  /**
   * Get the files in the storage directory.
   * @param shards The shards to get the files from. Default: all shards present in instructions.
   * @param useCachedStorageFiles If true, it will use the cached storage files. Default is false.
   * @param useCachedFilesOfNodes If true, it will use the cached files of nodes. Default is false.
   * @returns The files in the storage directory.
   */
  declare getStorageFiles: OmitThisParameter<typeof getStorageFiles>;

  /**
   * Substitute the files in the nodes with the files in the storage directory.
   * @param useCachedStorageFiles If true, it will use the cached storage files. Default is false.
   * @param useCachedFilesOfNodes If true, it will use the cached files of nodes. Default is false.
   * @param useCachedDockersStatuses If true, it will use the cached docker statuses. Default is false.
   */
  declare substituteFiles: OmitThisParameter<typeof substituteFiles>;

  /**
   * Delete unused files in the storage folder.
   * @param useCachedStorageFiles If true, it will use the cached storage files. Default is false.
   */
  declare deleteUnusedFiles: OmitThisParameter<typeof deleteUnusedFiles>;
}

DuplicatedFilesCleaner.prototype.getInfo = getInfo;
DuplicatedFilesCleaner.prototype.getFilesOfNodes = getFilesOfNodes;
DuplicatedFilesCleaner.prototype.move = move;
DuplicatedFilesCleaner.prototype.copyData = copyData;
DuplicatedFilesCleaner.prototype.run = run;
DuplicatedFilesCleaner.prototype.moveFilesToStorage = moveFilesToStorage;
DuplicatedFilesCleaner.prototype.getStorageFiles = getStorageFiles;
DuplicatedFilesCleaner.prototype.substituteFiles = substituteFiles;
DuplicatedFilesCleaner.prototype.deleteUnusedFiles = deleteUnusedFiles;