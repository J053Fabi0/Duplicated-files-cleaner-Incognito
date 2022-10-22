import axiod from "axiod";
import constants from "./constants.ts";
import Roles from "./types/roles.type.ts";
import { nodesDB } from "./db/collections/collections.ts";

const { validatorPublicKeys = {} } = constants;

export default async function getNodesInfo() {
  const allNodesIndex = nodesDB.find({}).map(({ index }) => index);

  const roles: Record<number, Promise<Roles | "ERROR"> | Roles | "ERROR"> = {};
  for (const nodeIndex of allNodesIndex)
    roles[nodeIndex] = getRoleOfNode(validatorPublicKeys[nodeIndex])
      .then((role) => (roles[nodeIndex] = role))
      .catch(() => (roles[nodeIndex] = "ERROR"));

  await Promise.allSettled(Object.values(roles));

  return roles as Record<number, Roles | "ERROR">;
}

const getRoleOfNode = async (validatorPublicKey: string) =>
  (await axiod.post("https://monitor.incognito.org/pubkeystat/stat", { mpk: validatorPublicKey })).data[0]
    .Role as Roles;
