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
    console.error("Handled error:", e.message);
    Deno.mkdirSync(shardStoragePath, { recursive: true });
  }

  storageFiles[shardName] = getFiles(shardStoragePath);
}

export default function run() {
  try {
    console.log(storageFiles.beacon.length);

    // Move the new files to the storage directory.
    for (const { shardName, nodes } of instructions) {
      const shardStorageFiles = storageFiles[shardName];
      const shardStoragePath = join(storageHomePath, shardName);

      for (const node of nodes) {
        const shardPath = join(homePath, `/node_data_${node}/mainnet/block/${shardName}`);
        const filesOfNode = getFiles(shardPath)
          .slice(filesToStrip)
          .filter((file) => file.isSymlink === false);

        // create hard links all the files inside storageDirectory
        for (const file of filesOfNode)
          try {
            // Create the hard link in the storage directory.
            Deno.linkSync(join(shardPath, file.name), join(shardStoragePath, file.name));
            shardStorageFiles.push(file);
          } catch {
            // The file already exists.
          }
      }

      storageFiles[shardName] = storageFiles[shardName].sort((a, b) => b.number - a.number);
    }

    console.log(storageFiles.beacon.length);

    // Substitute files in nodes with the ones in storage.
    for (const { shardName, nodes } of instructions) {
      const shardStoragePath = join(storageHomePath, shardName);

      for (const node of nodes) {
        const shardStorageFiles = storageFiles[shardName];
        const shardPath = join(homePath, `/node_data_${node}/mainnet/block/${shardName}`);
        const filesOfNode = getFiles(shardPath).filter((file) => file.isSymlink === false);

        fileFor: for (const file of filesOfNode) {
          // If the file is not in the storage directory, skip it.
          // Compare the number. Because it is sorted from high to low, it will continue if the number is lower.
          for (const storageFile of shardStorageFiles) {
            if (storageFile.number === file.number) break;
            if (storageFile.number < file.number) continue fileFor;
          }

          const from = join(shardStoragePath, file.name);
          const to = join(shardPath, file.name);

          try {
            Deno.removeSync(to);
            Deno.symlinkSync(from, to);
          } catch {
            //
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}
