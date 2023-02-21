import axiod from "axiod";
import { lodash } from "lodash";
import constants from "../constants.ts";
import Roles from "../types/roles.type.ts";
import shouldNodeBeSkipped from "./shouldNodeBeSkipped.ts";

const { validatorPublicKeys = {} } = constants;
// the monitor API only accepts a maximum of 50 public keys at a time, so we split them into chunks of 40 to be safe
const mpks = lodash.chunk(Object.values(validatorPublicKeys), 40).map((chunk) => chunk.join(","));

export type NodeStatus = { role: Roles | "ERROR" | "UNKNOWN"; epochsToNextEvent: number; skip: boolean };
export type NodesStatus = Record<string | number, NodeStatus>;

export default async function getNodesStatus() {
  const nodesStatus: NodesStatus = {};

  if (Deno.args.includes("--skip-checks")) {
    for (const nodeIndex of Object.keys(validatorPublicKeys))
      nodesStatus[nodeIndex] = {
        skip: false,
        role: "UNKNOWN",
        epochsToNextEvent: 0,
      };
    return nodesStatus;
  }

  for (const mpk of mpks) {
    const { data } = await axiod.post<
      | {
          Role: Roles;
          NextEventMsg: string;
          MiningPubkey: string;
        }[]
      | { error: string }
    >("https://monitor.incognito.org/pubkeystat/stat", { mpk });

    if ("error" in data)
      throw new Error(
        "There's an error with the monitor's API: " +
          data.error +
          "\n\nIf you want to ignore the error, run the script with the --skip-checks flag: deno task run --skip-checks" +
          "Keep in mind that this will skip the check for the nodes that are in or about to be in committee."
      );

    for (const { Role, NextEventMsg, MiningPubkey } of data) {
      const nodeIndex = Object.entries(validatorPublicKeys).find(([, mpk]) => mpk === MiningPubkey)?.[0];
      if (!nodeIndex) continue;
      // get first number from string using regex and parse it to number
      const epochsToNextEvent = Number(NextEventMsg.match(/^\d+/)?.[0] ?? 0);
      nodesStatus[nodeIndex] = {
        role: Role,
        epochsToNextEvent,
        skip: shouldNodeBeSkipped({ role: Role, epochsToNextEvent }),
      };
    }
  }

  return nodesStatus;
}
