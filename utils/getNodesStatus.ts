import axiod from "axiod";
import constants from "../constants.ts";
import Roles from "../types/roles.type.ts";
import shouldNodeBeSkipped from "./shouldNodeBeSkipped.ts";

const { validatorPublicKeys = {} } = constants;
const mpk = Object.values(validatorPublicKeys).join(",");

export interface NodeStatus {
  skip: boolean;
  role: Roles | "ERROR";
  epochsToNextEvent: number;
}
export type NodesStatus = Record<string | number, NodeStatus>;

export default async function getNodesStatus() {
  const toReturn: NodesStatus = {};

  const { data } = await axiod.post<
    {
      Role: Roles;
      NextEventMsg: string;
      MiningPubkey: string;
    }[]
  >("https://monitor.incognito.org/pubkeystat/stat", { mpk });

  for (const { Role, NextEventMsg, MiningPubkey } of data) {
    const nodeIndex = Object.entries(validatorPublicKeys).find(([, mpk]) => mpk === MiningPubkey)?.[0];
    if (!nodeIndex) continue;
    // get first number from string using regex and parse it to number
    const epochsToNextEvent = Number(NextEventMsg.match(/^\d+/)?.[0] ?? 0);
    toReturn[nodeIndex] = {
      role: Role,
      epochsToNextEvent,
      skip: shouldNodeBeSkipped({ role: Role, epochsToNextEvent }),
    };
  }

  return toReturn;
}
