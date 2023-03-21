import { join } from "../deps.ts";
import { dockerPs } from "../utils/commands.ts";
import DuplicatedFilesCleaner from "../DuplicatedFilesCleaner.ts";

export default async function substituteFiles(
  this: DuplicatedFilesCleaner,
  { useCachedStorageFiles = false, useCachedFilesOfNodes = false, useCachedDockersStatuses = false } = {}
) {
  const storageFiles = this.getStorageFiles({ useCache: useCachedStorageFiles });
  const filesOfNodes = await this.getFilesOfNodes({ useCache: useCachedFilesOfNodes });
  const dockerStatuses = await dockerPs(this.usedNodes, useCachedDockersStatuses);

  for (const { shardName, nodes } of this.instructions) {
    console.group(`Substituting files in ${shardName}`);

    const shardStoragePath = join(this.homeStoragePath, shardName);

    for (const node of nodes) {
      console.group("Prossesing node", node);

      const shardStorageFiles = storageFiles[shardName];
      const defaultStorageFile = shardStorageFiles[0];
      const shardPath = join(this.homePath, `/node_data_${node}/mainnet/block/${shardName}`);

      let filesProcessed = 0;

      // if filesToStripIfOnline is negative, only deal with offline nodes
      if (this.filesToStripIfOnline < 0 && dockerStatuses[node] === "ONLINE")
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
