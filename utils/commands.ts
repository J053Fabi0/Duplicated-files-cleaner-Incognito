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

type Status = "created" | "restarting" | "running" | "removing" | "paused" | "exited" | "dead";

interface RawDockerInfo {
  /** The full name of the container. */
  name: string;
  /**
   * The status of the container.
   * - `created`: The container has been created, but not started.
   * - `restarting`: The container is in the process of being restarted.
   * - `running`: The container is currently running.
   * - `removing`: The container is in the process of being removed.
   * - `paused`: The container has been paused.
   * - `exited`: The container has exited.
   * - `dead`: The container has died due to an error or crash.
   */
  status: Status;
  /** Whether the container is paused with the command `docker pause`. */
  paused: boolean;
  /** Whether the container is running. */
  running: boolean;
  /** The date when the container was started. */
  startedAt: string;
  /** The date when the container was finished. */
  finishedAt: string;
  /** Whether the container is restarting. */
  restarting: boolean;
}

export interface DockerInfo extends Omit<RawDockerInfo, "startedAt" | "finishedAt"> {
  startedAt: Date;
  finishedAt: Date;
}

export type DockersInfo = Record<string, DockerInfo>;

let dockersInfoCache: DockersInfo | undefined = undefined;

/**
 * @param nodes The index of the nodes. If not provided, it will get the info from all nodes.
 * @param useCache Use cached value if exists. Default is false.
 * @returns The info of the containers.
 */
export async function dockerPs(nodes: (number | string)[] | Set<number | string> = [], useCache = false) {
  if (useCache && dockersInfoCache) return dockersInfoCache;

  const args = [
    "inspect",
    "--format",
    "{" +
      '"name":       "{{.Name}}",' +
      '"paused":      {{.State.Paused}},' +
      '"status":     "{{.State.Status}}",' +
      '"running":     {{.State.Running}},' +
      '"restarting":  {{.State.Restarting}},' +
      '"startedAt":  "{{.State.StartedAt}}",' +
      '"finishedAt": "{{.State.FinishedAt}}"' +
      "},",
  ];

  const numberOfNodes = nodes instanceof Set ? nodes.size : nodes.length;

  if (numberOfNodes === 0) {
    // push the ids of all nodes
    const ids = await _docker(["ps", "-aq", "--filter", "name=^inc_mainnet_\\d"], (v) =>
      v.split("\n").filter(Boolean)
    );
    args.push(...ids);
  } else {
    // push the names of the provided nodes
    args.push(...(nodes instanceof Set ? [...nodes] : nodes).map((v) => `inc_mainnet_${v}`));
  }

  const dockersInfo = (await _docker(args, (v) => JSON.parse(`[${v.slice(0, -2)}]`) as RawDockerInfo[])).reduce(
    (obj, v) => {
      // The names are in the format "/inc_mainnet_1" so we get rid of the first 13 characters.
      obj[v.name.slice(13)] = {
        ...v,
        name: v.name.slice(1),
        startedAt: new Date(v.startedAt),
        finishedAt: new Date(v.finishedAt),
      };

      return obj;
    },
    {} as DockersInfo
  );

  dockersInfoCache = dockersInfo;

  return dockersInfo;
}
