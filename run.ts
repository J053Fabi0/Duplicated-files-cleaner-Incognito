import substituteFiles from "./substituteFiles.ts";
import deleteUnusedFiles from "./deleteUnusedFiles.ts";
import moveFilesToStorage from "./moveFilesToStorage.ts";
import constants from "./constants.ts";
import { df } from "./utils/commands.ts";

const { fileSystem } = constants;

export default async function run() {
  try {
    if (fileSystem)
      console.log("File system usage:", await df(["-h", fileSystem, "--output=used,avail,pcent"]), "\n");

    // Move the new files to the storage directory.
    await moveFilesToStorage();
    console.log();

    // Substitute files in nodes with the ones in storage.
    await substituteFiles();
    console.log();

    // Delete the files that are not used.
    await deleteUnusedFiles();

    if (fileSystem)
      console.log("File system usage now:", await df(["-h", fileSystem, "--output=used,avail,pcent"]));
  } catch (e) {
    console.error(e);
  }
}
