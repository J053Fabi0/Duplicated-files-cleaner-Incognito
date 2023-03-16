import { join } from "./deps.ts";
import constants from "./constants.ts";
import getFilesOfNodes from "./getFilesOfNodes.ts";
import getStorageFiles, { homeStoragePath } from "./getStorageFiles.ts";

const { homePath, instructions } = constants;

export default async function substituteFiles() {
  const storageFiles = getStorageFiles();
  const filesOfNodes = await getFilesOfNodes();

  for (const { shardName, nodes } of instructions) {
    console.group(`Substituting files in ${shardName}`);

    const shardStoragePath = join(homeStoragePath, shardName);

    for (const node of nodes) {
      console.group("Prossesing node", node);

      const shardStorageFiles = storageFiles[shardName];
      const defaultStorageFile = shardStorageFiles[0];
      const shardPath = join(homePath, `/node_data_${node}/mainnet/block/${shardName}`);

      let filesRemoved = 0;
      await Promise.all(
        filesOfNodes[shardName][node].map(async (file) => {
          // If the file is not in the storage directory, skip it.
          // Because it is sorted from high to low, it will return if the files are already lower.
          let storageFile = defaultStorageFile;
          for (storageFile of shardStorageFiles) {
            if (storageFile.number === file.number) break;
            if (storageFile.number < file.number) return;
          }

          const from = join(shardStoragePath, file.name);
          const to = join(shardPath, file.name);

          try {
            await Deno.remove(to);
            await Deno.link(from, to);
            filesRemoved++;
          } catch {
            //
          }

          storageFile.used = true;
        })
      );

      console.log("Files removed:", filesRemoved);
      console.groupEnd();
    }

    console.groupEnd();
  }
}
