import constants from "./constants.ts";

import { join } from "https://deno.land/std@0.179.0/path/mod.ts";
import getFiles, { File } from "./utils/getFiles.ts";

const { homePath, storageFolder, instructions, filesToStrip } = constants;
const homeStoragePath = join(homePath, storageFolder);

type StorageFile = File & { used: boolean };

const storageFiles: Record<string, StorageFile[]> = {};
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
        await Promise.all(
          filesOfNode.map((file) =>
            (async () => {
              try {
                // Create the hard link in the storage directory.
                await Deno.link(join(shardPath, file.name), join(shardStoragePath, file.name));
                shardStorageFiles.push({ ...file, used: false });
              } catch {
                // The file already exists.
              }
            })()
          )
        );
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
        const shardStorageFiles = storageFiles[shardName];
        const defaultStorageFile = shardStorageFiles[0];
        const shardPath = join(homePath, `/node_data_${node}/mainnet/block/${shardName}`);

        await Promise.all(
          getFiles(shardPath).map((file) =>
            (async () => {
              // If the file is not in the storage directory, skip it.
              // Because it is sorted from high to low, it will continue if the number is lower.
              let storageFile: StorageFile = defaultStorageFile;
              for (storageFile of shardStorageFiles) {
                if (storageFile.number === file.number) break;
                if (storageFile.number < file.number) return;
              }

              const from = join(shardStoragePath, file.name);
              const to = join(shardPath, file.name);

              try {
                await Deno.remove(to);
                await Deno.link(from, to);
              } catch {
                //
              }

              storageFile.used = true;
            })()
          )
        );
      }
    }

    // Delete the files that are not used.
    for (const { shardName } of instructions) {
      const shardStoragePath = join(homeStoragePath, shardName);

      const promises: Promise<void>[] = [];

      for (const file of storageFiles[shardName])
        if (file.used === false) promises.push(Deno.remove(join(shardStoragePath, file.name)).catch(() => {}));

      await Promise.all(promises);
    }
  } catch (e) {
    console.error(e);
  }
}
