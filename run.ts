import substituteFiles from "./substituteFiles.ts";
import deleteUnusedFiles from "./deleteUnusedFiles.ts";
import moveFilesToStorage from "./moveFilesToStorage.ts";

export default async function run() {
  try {
    // Move the new files to the storage directory.
    await moveFilesToStorage();
    console.log();

    // Substitute files in nodes with the ones in storage.
    await substituteFiles();
    console.log();

    // Delete the files that are not used.
    await deleteUnusedFiles();
  } catch (e) {
    console.error(e);
  }
}
