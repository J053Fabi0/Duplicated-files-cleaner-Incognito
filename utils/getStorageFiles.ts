import { join } from "../deps.ts";
import { shardsNames } from "../mod.ts";
import getFiles, { LDBFile } from "../utils/getFiles.ts";
import DuplicatedFilesCleaner from "../src/DuplicatedFilesCleaner.ts";

export type StorageFile = LDBFile & { used: number };
export type StorageFiles = Record<string, StorageFile[]>;

let cached = false;
const storageFilesCache: StorageFiles = {};

export default function getStorageFiles(
  this: DuplicatedFilesCleaner,
  { shards = shardsNames, useCache = false } = {}
): StorageFiles {
  if (cached && useCache) return storageFilesCache;

  for (const shardName of shards) {
    const shardStoragePath = join(this.homeStoragePath, shardName);

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

    storageFilesCache[shardName] = getFiles(shardStoragePath).map((file) => ({ ...file, used: 0 }));
  }

  cached = true;
  return storageFilesCache;
}
