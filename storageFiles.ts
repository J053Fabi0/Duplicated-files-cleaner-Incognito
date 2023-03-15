export type StorageFile = File & { used: boolean };
export type StorageFiles = Record<string, StorageFile[]>;

export const storageFiles: StorageFiles = {};

import { join } from "./deps.ts";
import constants from "./constants.ts";

import getFiles, { File } from "./utils/getFiles.ts";

const { homePath, storageFolder, instructions } = constants;
export const homeStoragePath = join(homePath, storageFolder);

for (const { shardName } of instructions) {
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

  storageFiles[shardName] = getFiles(shardStoragePath).map((file) => ({ ...file, used: false }));
}
