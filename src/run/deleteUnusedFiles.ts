import { join } from "../../deps.ts";
import { ShardsNames } from "../../mod.ts";
import DuplicatedFilesCleaner from "../DuplicatedFilesCleaner.ts";

interface DeleteUnusedFilesOptions {
  useCachedStorageFiles?: boolean;
  shards?: ShardsNames[];
}

export default async function deleteUnusedFiles(
  this: DuplicatedFilesCleaner,
  { useCachedStorageFiles = false, shards = ["beacon"] }: DeleteUnusedFilesOptions = {}
) {
  const storageFiles = this.getStorageFiles({ useCache: useCachedStorageFiles });

  for (const shardName of shards) {
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
