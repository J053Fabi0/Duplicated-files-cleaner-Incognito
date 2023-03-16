import { join } from "./deps.ts";
import constants from "./constants.ts";
import getStorageFiles, { homeStoragePath } from "./getStorageFiles.ts";

const { instructions } = constants;

export default async function deleteUnusedFiles() {
  const storageFiles = getStorageFiles();

  for (const { shardName } of instructions) {
    const shardStoragePath = join(homeStoragePath, shardName);

    console.group(`Deleting unused files in ${shardStoragePath}`);

    const promises: Promise<void>[] = [];

    // If the files is only used once or less there is no need to keep it.
    for (const file of storageFiles[shardName])
      if (file.used <= 1) promises.push(Deno.remove(join(shardStoragePath, file.name)).catch(() => {}));

    await Promise.all(promises);
    console.log(promises.length);
    console.groupEnd();
  }
}
