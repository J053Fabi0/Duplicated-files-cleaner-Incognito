import { join } from "../../deps.ts";
import DuplicatedFilesCleaner from "../DuplicatedFilesCleaner.ts";

export default async function deleteUnusedFiles(this: DuplicatedFilesCleaner, useCachedStorageFiles = false) {
  const storageFiles = this.getStorageFiles({ useCache: useCachedStorageFiles });

  for (const { shardName } of this.instructions) {
    const shardStoragePath = join(this.homeStoragePath, shardName);

    console.group(`Deleting unused files in ${shardStoragePath}`);

    const promises: Promise<void>[] = [];

    for (const file of storageFiles[shardName])
      if (file.used === 0) promises.push(Deno.remove(join(shardStoragePath, file.name)).catch(() => {}));

    await Promise.all(promises);
    console.log(promises.length);
    console.groupEnd();
  }
}
