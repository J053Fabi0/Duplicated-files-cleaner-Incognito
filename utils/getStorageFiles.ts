import { join } from "../deps.ts";
import { ShardsNames } from "../types/shards.type.ts";
import getFiles, { LDBFile } from "../utils/getFiles.ts";

export type StorageFile = LDBFile & { used: number };
export type StorageFiles = Record<string, StorageFile[]>;

let cached = false;
const storageFiles: StorageFiles = {};

interface GetStorageFilesOptions {
  homePath?: string;
  ignoreCache?: boolean;
  storageFolder?: string;
  shards: ShardsNames[];
}

/**
 * Get the files in the storage directory.
 * @param shards The shards to get the files from.
 * @param homePath The home path of the nodes. Usually /home/incognito
 * @param storageFolder The name of the storage folder. Usually storage
 * @param ignoreCache Ignore the cache and get the files again. Default: false
 * @returns The files in the storage directory.
 */
export default function getStorageFiles({
  shards,
  ignoreCache = false,
  storageFolder = "storage",
  homePath = "/home/incognito",
}: GetStorageFilesOptions): StorageFiles {
  const homeStoragePath = join(homePath, storageFolder);

  if (cached && ignoreCache === false) return storageFiles;

  for (const shardName of shards) {
    const shardStoragePath = join(homeStoragePath, shardName);

    // If it doesn't exist, create it.
    try {
      if (Deno.statSync(shardStoragePath).isDirectory === false) {
        // Delete the file and create the directory.
        Deno.removeSync(shardStoragePath);
        throw new Error(`${shardStoragePath} is not a directory. Deleted it.`);
      }
    } catch (e) {
      console.error("Handled error:", e.message);
      Deno.mkdirSync(shardStoragePath, { recursive: true });
    }

    storageFiles[shardName] = getFiles(shardStoragePath).map((file) => ({ ...file, used: 0 }));
  }

  cached = true;
  return storageFiles;
}
