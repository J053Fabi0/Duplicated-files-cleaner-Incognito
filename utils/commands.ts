import repeatUntilNoError from "./repeatUntilNoError.ts";
import binaryWrapper from "./binaryWrapper.ts";
import constants from "../constants.ts";
export const cp = binaryWrapper("cp");
export const rm = binaryWrapper("rm");
export const ls = binaryWrapper("ls");
export const chown = binaryWrapper("chown");

const { validatorPublicKeys } = constants;

const _docker = binaryWrapper("docker");
export const docker = (name: string | string[], action: "start" | "stop", maxRetries = 5) =>
  repeatUntilNoError(
    () => _docker(["container", action, ...(typeof name === "string" ? [name] : name)], (v) => v.slice(0, -1)),
    maxRetries,
    undefined,
    (e, i) => console.log(`Error on attempt ${i} of ${maxRetries} to ${action} container ${name}:\n${e}`)
  );

type DockersStatus = Record<string, "ONLINE" | "OFFLINE">;
let dockersStatus: DockersStatus | undefined = undefined;
export const dockerPs = () =>
  _docker(["ps", "--all", "--no-trunc", "--filter", "name=^inc_mainnet_"], (v) => {
    // Return the cached value if it exists.
    if (!dockersStatus) {
      dockersStatus = v
        // Get rid of a last "\n" that always has nothing.
        .slice(0, -1)
        .split("\n")
        // Remove the first line that is the header.
        .slice(1)
        .reduce((obj, v) => {
          obj[/inc_mainnet_\d+/.exec(v)![0]] = / Up (\d+|about) /gi.test(v) ? "ONLINE" : "OFFLINE";
          return obj;
        }, {} as DockersStatus);

      for (const dockerIndex of Object.keys(validatorPublicKeys))
        if (dockersStatus[`inc_mainnet_${dockerIndex}`] === undefined)
          dockersStatus[`inc_mainnet_${dockerIndex}`] = "OFFLINE";
    }

    return dockersStatus;
  });

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
