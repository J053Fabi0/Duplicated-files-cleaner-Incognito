import binaryWrapper from "./binaryWrapper.ts";
import repeatUntilNoError from "./repeatUntilNoError.ts";

export const df = binaryWrapper("df");

const _docker = binaryWrapper("docker");
export const docker = (name: string | string[], action: "start" | "stop", maxRetries = 5) =>
  repeatUntilNoError(
    () => _docker(["container", action, ...(typeof name === "string" ? [name] : name)], (v) => v.slice(0, -1)),
    maxRetries,
    undefined,
    (e, i) => console.log(`Error on attempt ${i} of ${maxRetries} to ${action} container ${name}:\n${e}`)
  );

type DockersStatus = Record<string, "ONLINE" | "OFFLINE">;
let dockersStatusCache: DockersStatus | undefined = undefined;
/**
 * @param nodes The nodes to get the info from. If not provided, it will get the info from all nodes.
 * @param useCache Use cache if exists. Default is false.
 * @returns Key is the node index and value is the docker status ("ONLINE" or "OFFLINE").
 */
export const dockerPs = (nodes: (number | string)[] | Set<number | string> = [], useCache = false) =>
  _docker(["ps", "--no-trunc", "--filter", "name=^inc_mainnet_"], (v) => {
    if (!dockersStatusCache || !useCache) {
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

      dockersStatusCache = {};
      const numberOfNodes = nodes instanceof Set ? nodes.size : nodes.length;
      for (const dockerIndex of numberOfNodes === 0 ? Object.keys(tempDockersStatus) : nodes)
        dockersStatusCache[dockerIndex] = tempDockersStatus[dockerIndex] ?? "OFFLINE";
    }

    return dockersStatusCache;
  });
