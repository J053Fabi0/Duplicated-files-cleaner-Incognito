import { join } from "./deps.ts";
import constants from "./constants.ts";
import getFiles from "./utils/getFiles.ts";
import { homeStoragePath, storageFiles } from "./storageFiles.ts";

const { homePath, instructions, filesToStrip } = constants;

export default async function moveFilesToStorage() {
  for (const { shardName, nodes } of instructions) {
    const shardStorageFiles = storageFiles[shardName];
    const shardStoragePath = join(homeStoragePath, shardName);

    console.group(shardName);
    console.log(shardStorageFiles.length);

    for (const node of nodes) {
      console.log(`Prossesing node ${node}`);

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
}
