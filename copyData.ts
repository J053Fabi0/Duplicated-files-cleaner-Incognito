import { join, MultiProgressBar } from "./deps.ts";
import constants from "./constants.ts";
import getFiles from "./utils/getFiles.ts";

const { homePath, filesToStripIfOffline } = constants;

const bars = new MultiProgressBar({
  complete: "#",
  incomplete: ".",
  display: "[:bar] :text :percent :completed/:total :time",
});

export default async function copyData(from: string, to: string, shard: string) {
  try {
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
    bars.render([{ completed: otherFiles.length, total: otherFiles.length, text: "\n" }]);
  } catch (e) {
    console.error(e);
  }
}

async function copyFileOrDir(fromPath: string, toPath: string, file: Deno.DirEntry) {
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
