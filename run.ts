import constants from "./constants.ts";

import { join } from "https://deno.land/std@0.179.0/path/mod.ts";
import getFiles from "./utils/getFiles.ts";

const { homePath, storageFolder, instructions, filesToStrip } = constants;
const storageHomePath = join(homePath, storageFolder);

const storageFiles: Record<string, ReturnType<typeof getFiles>> = {};
for (const { shardName } of instructions) {
  const shardStoragePath = join(storageHomePath, shardName);

  // If it doesn't exist, create it.
  try {
    if (Deno.statSync(shardStoragePath).isDirectory === false) {
      // Delete the file and create the directory.
      Deno.removeSync(shardStoragePath);
      throw new Error(`${shardStoragePath} is not a directory. Deleted it.`);
    }
  } catch (e) {
    console.error(e);
    Deno.mkdirSync(shardStoragePath, { recursive: true });
  }

  storageFiles[shardName] = getFiles(shardStoragePath);
}

export default function run() {
  try {
    console.log(storageFiles.beacon.length);

    // Move the new files to the storage directory.
    for (const { shardName, nodes } of instructions) {
      const shardStoragePath = join(storageHomePath, shardName);

      for (const node of nodes) {
        const shardPath = join(homePath, `node_data_${node}/mainnet/block/${shardName}`);
        const filesOfNode = getFiles(shardPath).slice(filesToStrip);

        // create hard links all the files inside storageDirectory
        for (const file of filesOfNode) {
          const shardStorageFiles = storageFiles[shardName];
          const { name: fileName } = file;

          try {
            // Create the hard link.
            Deno.linkSync(join(shardPath, fileName), join(shardStoragePath, fileName));

            shardStorageFiles.push(file);
          } catch {
            // The file already exists.
          }
        }

        storageFiles[shardName] = storageFiles[shardName].sort((a, b) => b.number - a.number);
      }
    }

    console.log(storageFiles.beacon.length);
  } catch (e) {
    console.error(e);
  }
}
