import { join } from "./deps.ts";
import constants from "./constants.ts";
import getFilesOfNodes from "./getFilesOfNodes.ts";
import { homeStoragePath, storageFiles } from "./storageFiles.ts";

const { homePath, instructions } = constants;

export default async function substituteFiles() {
  const filesOfNodes = await getFilesOfNodes();

  for (const { shardName, nodes } of instructions) {
    console.group(`Substituting files in ${shardName}`);

    const shardStoragePath = join(homeStoragePath, shardName);

    for (const node of nodes) {
      console.log(`Prossesing node ${node}`);

      const shardStorageFiles = storageFiles[shardName];
      const defaultStorageFile = shardStorageFiles[0];
      const shardPath = join(homePath, `/node_data_${node}/mainnet/block/${shardName}`);

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
          } catch {
            //
          }

          storageFile.used = true;
        })
      );
    }

    console.groupEnd();
  }
}
