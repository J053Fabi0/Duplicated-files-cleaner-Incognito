import constants from "../constants.ts";
import binaryWrapper from "./binaryWrapper.ts";
import repeatUntilNoError from "./repeatUntilNoError.ts";

export const df = binaryWrapper("df");

const { instructions } = constants;

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
  _docker(["ps", "--no-trunc", "--filter", "name=^inc_mainnet_"], (v) => {
    // Return the cached value if it exists.
    // Otherwise create it.
    if (!dockersStatus) {
      const tempDockersStatus = v
        // Get rid of a last "\n" that always has nothing.
        .slice(0, -1)
        .split("\n")
        // Remove the first line that is the header.
        .slice(1)
        .reduce((obj, v) => {
          obj[/(?<=inc_mainnet_)\d+/.exec(v)![0]] = / Up (\d+|about) /gi.test(v) ? "ONLINE" : "OFFLINE";
          return obj;
        }, {} as DockersStatus);

      // Get all the nodes present in instructions
      const allNodes = instructions.reduce((set, i) => {
        for (const node of i.nodes) set.add(node);
        return set;
      }, new Set<number>());

      dockersStatus = {};
      for (const dockerIndex of allNodes) dockersStatus[dockerIndex] = tempDockersStatus[dockerIndex] ?? "OFFLINE";
    }

    return dockersStatus;
  });
