import constants from "./constants.ts";

import { join } from "https://deno.land/std@0.179.0/path/mod.ts";
import getFiles, { File } from "./utils/getFiles.ts";

const { homePath, storageFolder, instructions, filesToStrip } = constants;
const homeStoragePath = join(homePath, storageFolder);

const storageFiles: Record<string, (File & { used: boolean })[]> = {};
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

export default async function run() {
  try {
    // Move the new files to the storage directory.
    for (const { shardName, nodes } of instructions) {
      const shardStorageFiles = storageFiles[shardName];
      const shardStoragePath = join(homeStoragePath, shardName);

      console.group(shardName);
      console.log(shardStorageFiles.length);

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
            shardStorageFiles.push({ ...file, used: false });
          } catch {
            // The file already exists.
          }
      }

      storageFiles[shardName] = storageFiles[shardName].sort((a, b) => b.number - a.number);

      console.log(storageFiles[shardName].length);
      console.groupEnd();
    }

    // Substitute files in nodes with the ones in storage.
    for (const { shardName, nodes } of instructions) {
      console.log(`Substituting files in ${shardName}`);

      const shardStoragePath = join(homeStoragePath, shardName);

      for (const node of nodes) {
        const promises: Promise<void>[] = [];
        const shardStorageFiles = storageFiles[shardName];
        const shardPath = join(homePath, `/node_data_${node}/mainnet/block/${shardName}`);

        fileFor: for (const file of getFiles(shardPath)) {
          // If the file is not in the storage directory, skip it.
          // Compare the number. Because it is sorted from high to low, it will continue if the number is lower.
          let storageFile: File & { used: boolean } = shardStorageFiles[0];
          for (storageFile of shardStorageFiles) {
            if (storageFile.number === file.number) break;
            if (storageFile.number < file.number) continue fileFor;
          }

          promises.push(
            (async (from, to) => {
              try {
                await Deno.remove(to);
                await Deno.link(from, to);
              } catch {
                //
              }
              storageFile.used = true;
            })(join(shardStoragePath, file.name), join(shardPath, file.name))
          );
        }

        await Promise.all(promises);
      }
    }

    // Delete the files that are not used.
    for (const { shardName } of instructions) {
      const shardStoragePath = join(homeStoragePath, shardName);

      for (const file of storageFiles[shardName])
        if (file.used === false)
          try {
            Deno.removeSync(join(shardStoragePath, file.name));
          } catch {
            //
          }
    }
  } catch (e) {
    console.error(e);
  }
}
