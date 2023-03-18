import { join } from "../deps.ts";
import constants from "../constants.ts";
import getFilesOfNodes from "../utils/getFilesOfNodes.ts";
import getStorageFiles, { homeStoragePath } from "../utils/getStorageFiles.ts";

const { homePath, instructions } = constants;

export default async function moveFilesToStorage() {
  const storageFiles = getStorageFiles();
  const filesOfNodes = await getFilesOfNodes();

  for (const { shardName, nodes } of instructions) {
    const shardStorageFiles = storageFiles[shardName];
    const shardStoragePath = join(homeStoragePath, shardName);

    console.group(shardName);
    const numberOfFiles = shardStorageFiles.length;
    console.log("Number of files:", numberOfFiles);

    for (const node of nodes) {
      console.log(`Prossesing node ${node}`);

      const shardPath = join(homePath, `/node_data_${node}/mainnet/block/${shardName}`);

      await Promise.all(
        filesOfNodes[shardName][node].map(async (file) => {
          try {
            // Create the hard link in the storage directory.
            await Deno.link(join(shardPath, file.name), join(shardStoragePath, file.name));
            shardStorageFiles.push({ ...file, used: 0 });
          } catch {
            // The file already exists.
          }
        })
      );
    }

    // Sort the files from high to low.
    storageFiles[shardName] = storageFiles[shardName].sort((a, b) => b.number - a.number);

    console.log("Net change of files:", storageFiles[shardName].length - numberOfFiles);
    console.groupEnd();
  }
}
