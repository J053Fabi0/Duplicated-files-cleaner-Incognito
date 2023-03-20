import getFiles from "./utils/getFiles.ts";
import { join, MultiProgressBar } from "./deps.ts";
import normalizeShards from "./utils/normalizeShards.ts";
import Shards, { ShardsNames, ShardsStr } from "./types/shards.type.ts";

const bars = new MultiProgressBar({
  complete: "#",
  incomplete: ".",
  display: "[:bar] :text :percent :completed/:total :time",
});

interface CopyDataOptions {
  to: string;
  from: string;
  homePath: string;
  logProgressBar?: boolean;
  filesToStripIfOffline?: number;
  shards?: (ShardsStr | Shards | ShardsNames)[];
}

/**
 * Copy a shard from one node to another.
 * @param homePath The home path of the nodes. Usually /home/incognito
 * @param from The index of the node to copy from
 * @param to The index of the node to copy to
 * @param shards The shards to copy. Defaults to ["beacon"]
 * @param filesToStripIfOffline The number of files to strip from the beginning of the shard if the node is offline. Defaults to 0.
 * @param logProgressBar Whether to log a progress bar. Defaults to false.
 */
export default async function copyData({
  to,
  from,
  homePath,
  shards = ["beacon"],
  logProgressBar = false,
  filesToStripIfOffline = 0,
}: CopyDataOptions) {
  for (const shard of normalizeShards(shards)) {
    console.log(`Moving ${shard}'s files from ${from} to ${to}`);

    const fromShardPath = join(homePath, `/node_data_${from}/mainnet/block/${shard}`);
    const toShardPath = join(homePath, `/node_data_${to}/mainnet/block/${shard}`);

    const allLdbFiles = getFiles(fromShardPath);

    const ldbFiles = allLdbFiles.slice(filesToStripIfOffline >= 0 ? filesToStripIfOffline : 0);
    const otherFiles = [
      // the files that are not ldb files
      ...[...Deno.readDirSync(fromShardPath)].filter((file) => !file.name.endsWith(".ldb")),
      // the files that were sliced from allLdbFiles
      ...allLdbFiles.slice(0, filesToStripIfOffline >= 0 ? filesToStripIfOffline : 0),
    ];

    console.log("Emptying the destination directory");
    // If the file exists, delete it
    await Deno.remove(toShardPath, { recursive: true }).catch(() => {});
    Deno.mkdirSync(toShardPath, { recursive: true });

    console.log("Copying the ldb files with hard links");
    await Promise.all(
      ldbFiles.map((file) => Deno.link(join(fromShardPath, file.name), join(toShardPath, file.name)))
    );

    let i = 0;
    if (logProgressBar)
      (async () => {
        while (i !== Infinity) {
          bars.render([{ completed: i, total: otherFiles.length, text: "\n" }]);
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      })();

    console.log("Copying the rest of the files with copy, including directories\n");
    await Promise.all(
      otherFiles.map((file) => copyFileOrDir(fromShardPath, toShardPath, file).finally(() => void i++))
    );

    i = Infinity;
    if (logProgressBar) {
      bars.render([{ completed: otherFiles.length, total: otherFiles.length, text: "\n" }]);
      bars.end();
    }
  }
}

/**
 * Copy a file or directory recursively
 * @param fromPath The path to copy from
 * @param toPath The path to copy to
 * @param file The file or directory to copy
 */
export async function copyFileOrDir(fromPath: string, toPath: string, file: Deno.DirEntry) {
  const fromFilePath = join(fromPath, file.name);
  const toFilePath = join(toPath, file.name);

  // If its a directory
  if (file.isDirectory) {
    // Create the directory
    Deno.mkdirSync(toFilePath, { recursive: true });

    // Copy the contents of the directory into the new directory recursively
    await Promise.all(
      [...Deno.readDirSync(fromFilePath)].map((dirFile) => copyFileOrDir(fromFilePath, toFilePath, dirFile))
    );
  }
  //
  // Else just copy the file
  else await Deno.copyFile(fromFilePath, toFilePath);
}
