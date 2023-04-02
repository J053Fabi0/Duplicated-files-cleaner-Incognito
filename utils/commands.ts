import binaryWrapper from "./binaryWrapper.ts";
import repeatUntilNoError from "./repeatUntilNoError.ts";

export const df = binaryWrapper("df");

const _docker = binaryWrapper("docker");
/**
 * Start or stop docker containers.
 * @param name The name or names of the containers.
 * @param action The action to perform on the containers.
 * @param maxRetries The maximum number of retries to perform the action if it fails. Default is 5.
 * @returns The output of the command.
 */
export const docker = (name: string | string[], action: "start" | "stop", maxRetries = 5) =>
  repeatUntilNoError(
    () => _docker(["container", action, ...(typeof name === "string" ? [name] : name)], (v) => v.slice(0, -1)),
    maxRetries,
    undefined,
    (e, i) => console.log(`Error on attempt ${i} of ${maxRetries} to ${action} container ${name}:\n${e}`)
  );

export interface DockerStatus {
  uptime: string;
  restarting: boolean;
  status: "ONLINE" | "OFFLINE";
}
export type DockersStatus = Record<string, DockerStatus>;
let dockersStatusCache: DockersStatus | undefined = undefined;
/**
 * @param nodes The nodes to get the info from. If not provided, it will get the info from all nodes.
 * @param useCache Use cache if exists. Default is false.
 * @returns Key is the node index and value is the docker status ("ONLINE" or "OFFLINE").
 */
export const dockerPs = (nodes: (number | string)[] | Set<number | string> = [], useCache = false) =>
  _docker(["ps", "--no-trunc", "--filter", "name=^inc_mainnet_", "--format", '"{{.Names}}¿{{.Status}}"'], (v) => {
    if (!dockersStatusCache || !useCache) {
      const tempDockersStatus = v
        // Get rid of a last "\n" that always has nothing.
        .slice(0, -1)
        .split("\n")
        .reduce((obj, v) => {
          const [name, status] = v.split("¿");
          // Always considered as online because the command only returns running containers.
          // No matter if it is restarting or not.
          obj[name.slice(12)] = {
            status: "ONLINE",
            uptime: status.split(" ")[0],
            restarting: status.includes("Restarting"),
          };

          return obj;
        }, {} as DockersStatus);

      dockersStatusCache = {};
      const numberOfNodes = nodes instanceof Set ? nodes.size : nodes.length;
      for (const dockerIndex of numberOfNodes === 0 ? Object.keys(tempDockersStatus) : nodes)
        dockersStatusCache[dockerIndex] = tempDockersStatus[dockerIndex]
          ? tempDockersStatus[dockerIndex]
          : {
              uptime: "",
              status: "OFFLINE",
              restarting: false,
            };
    }

    return dockersStatusCache;
  });
