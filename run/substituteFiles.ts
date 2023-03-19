import { join } from "../deps.ts";
import constants from "../constants.ts";
import { dockerPs } from "../utils/commands.ts";
import getFilesOfNodes from "../utils/getFilesOfNodes.ts";
import getStorageFiles, { homeStoragePath } from "../utils/getStorageFiles.ts";

const { homePath, instructions, filesToStripIfOnline } = constants;

export default async function substituteFiles() {
  const storageFiles = getStorageFiles();
  const dockerStatuses = await dockerPs();
  const filesOfNodes = await getFilesOfNodes();

  for (const { shardName, nodes } of instructions) {
    console.group(`Substituting files in ${shardName}`);

    const shardStoragePath = join(homeStoragePath, shardName);

    for (const node of nodes) {
      console.group("Prossesing node", node);

      const shardStorageFiles = storageFiles[shardName];
      const defaultStorageFile = shardStorageFiles[0];
      const shardPath = join(homePath, `/node_data_${node}/mainnet/block/${shardName}`);

      let filesProcessed = 0;

      // if filesToStripIfOnline is negative, only deal with offline nodes
      if (filesToStripIfOnline < 0 && dockerStatuses[`inc_mainnet_${node}`] === "ONLINE")
        console.log("Skipping node", node, "because it is online and filesToStripIfOffline is negative.");
      else
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
            storageFile.used++;
            filesProcessed++;
          })
        );

      console.log("Files processed:", filesProcessed, "\n");
      console.groupEnd();
    }

    console.log(
      "Total files removed:",
      Object.values(storageFiles).reduce(
        (total, files) =>
          total +
          files.reduce(
            (subTotal, file) =>
              file.used <= 0
                ? // if the file isn't used at least twice, it was really not removed.
                  subTotal
                : // The first file is not removed, only linked, so it is not counted.
                  subTotal + file.used - 1,
            0
          ),
        0
      ),
      "\n"
    );

    console.groupEnd();
  }
}
