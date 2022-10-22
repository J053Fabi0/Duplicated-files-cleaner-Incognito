import repeatUntilNoError from "./repeatUntilNoError.ts";
import binaryWrapper from "./binaryWrapper.ts";
export const chown = binaryWrapper("chown");
export const cp = binaryWrapper("cp");
export const rm = binaryWrapper("rm");
export const ls = binaryWrapper("ls");

const _docker = binaryWrapper("docker");
export const docker = (name: string, action: "start" | "stop", maxRetries = 5) =>
  repeatUntilNoError(
    () => _docker(["container", action, name], (v) => v.split("\n")[0]),
    maxRetries,
    undefined,
    (e, i) => console.log(`Error on attempt ${i} of ${maxRetries} to ${action} container ${name}:\n${e}`)
  );

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
