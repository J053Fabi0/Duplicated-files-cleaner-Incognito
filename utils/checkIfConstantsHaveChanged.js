const axios = require("axios");
const { validatorPublicKeys = {} } = require("../constants");
const { nodesDB } = require("../db/collections/collections");

module.exports = async function () {
  const indexesInConstants = Object.keys(validatorPublicKeys);

  const publicKeysInDB = {};
  const allDataInDB = nodesDB.find({});
  for (const { validatorPublicKey } of allDataInDB) publicKeysInDB[validatorPublicKey] = false;

  // Add any new node that is in the constants file needs to be added to the DB.
  for (const index of indexesInConstants) {
    const validatorPublicKey = validatorPublicKeys[index];
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
};

const getShardIDOfNode = async (validatorPublicKey) =>
  +(await axios.post("https://monitor.incognito.org/pubkeystat/stat", { mpk: validatorPublicKey })).data[0]
    .CommitteeChain;
