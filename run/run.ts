import constants from "../constants.ts";
import { df } from "../utils/commands.ts";
import substituteFiles from "./substituteFiles.ts";
import deleteUnusedFiles from "./deleteUnusedFiles.ts";
import moveFilesToStorage from "./moveFilesToStorage.ts";

const { fileSystem } = constants;

export default async function run() {
  try {
    const firstData = fileSystem ? await df(["-h", fileSystem, "--output=used,avail,pcent"]) : "";

    // Move the new files to the storage directory.
    await moveFilesToStorage();
    console.log();

    // Substitute files in nodes with the ones in storage.
    await substituteFiles();
    console.log();

    // Delete the files that are not used.
    await deleteUnusedFiles();

    if (fileSystem)
      console.log("\n", firstData, "\n", (await df(["-h", fileSystem, "--output=used,avail,pcent"])).slice(1));
  } catch (e) {
    console.error(e);
  }
}
