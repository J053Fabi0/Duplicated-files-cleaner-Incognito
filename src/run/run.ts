import DuplicatedFilesCleaner from "../DuplicatedFilesCleaner.ts";

/** Runs the whole process of deleting duplicated files. */
export default async function run(this: DuplicatedFilesCleaner) {
  try {
    // Move the new files to the storage directory.
    await this.moveFilesToStorage();
    console.log();

    // Substitute files in nodes with the ones in storage.
    await this.substituteFiles({ useCachedFilesOfNodes: true, useCachedStorageFiles: true });

    // Delete the files that are not used.
    await this.deleteUnusedFiles({ useCachedStorageFiles: true });
  } catch (e) {
    console.error(e);
  }
}
