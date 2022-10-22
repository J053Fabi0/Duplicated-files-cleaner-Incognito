import binaryWrapper from "./binaryWrapper.ts";
export const docker = binaryWrapper("docker");
export const chown = binaryWrapper("chown");
export const cp = binaryWrapper("cp");
export const rm = binaryWrapper("rm");
export const ls = binaryWrapper("ls");

export function getExtraFiles(nodePathToShard: string) {
  return ls([nodePathToShard], (v) =>
    v
      .split("\n")
      // Get rid of a last "\n" that always has nothing.
      .slice(0, -1)
      // Filter every file that doesn't end with '.ldb'.
      .filter((v) => v.endsWith(".ldb") === false)
  );
}
