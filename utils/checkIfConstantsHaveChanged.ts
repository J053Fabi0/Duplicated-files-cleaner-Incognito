import axiod from "axiod";
import constants from "../constants.ts";
import Shards from "../types/shards.type.ts";
import { nodesDB } from "../db/collections/collections.ts";

const { validatorPublicKeys = {} } = constants;

export default async function checkIfConstantsHaveChanged() {
  const indexesInConstants = Object.keys(validatorPublicKeys);

  const publicKeysInDB: Record<string, boolean> = {};
  const allDataInDB = nodesDB.find({});
  for (const { validatorPublicKey } of allDataInDB) publicKeysInDB[validatorPublicKey] = false;

  // Add any new node that is in the constants file needs to be added to the DB.
  for (const index of indexesInConstants) {
    const validatorPublicKey = validatorPublicKeys[+index];
    if (!nodesDB.findOne({ validatorPublicKey }))
      nodesDB.insertOne({
        index: +index,
        shardSeed: false,
        beaconSeed: false,
        validatorPublicKey,
        shardID: await getShardIDOfNode(validatorPublicKey),
      });
  }

  // Find if any of the nodes in DB are actually not present anymore in the constants file and delete them.
  const validatorPublicKeysArr = Object.values(validatorPublicKeys);
  for (const { validatorPublicKey } of allDataInDB)
    if (!validatorPublicKeysArr.includes(validatorPublicKey)) nodesDB.findAndRemove({ validatorPublicKey });
}

const getShardIDOfNode = async (validatorPublicKey: string) =>
  +(await axiod.post("https://monitor.incognito.org/pubkeystat/stat", { mpk: validatorPublicKey })).data[0]
    .CommitteeChain as Shards;
