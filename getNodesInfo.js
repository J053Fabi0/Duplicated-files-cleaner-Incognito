const axios = require("axios");
const { nodesDB } = require("./db/collections/collections");
const { validatorPublicKeys = {} } = require("./constants");

async function getNodesInfo() {
  const allNodesIndex = nodesDB.find({}).map(({ index }) => index);

  const roles = {};
  for (const nodeIndex of allNodesIndex)
    roles[nodeIndex] = getRoleOfNode(validatorPublicKeys[nodeIndex])
      .then((role) => (roles[nodeIndex] = role))
      .catch(() => (roles[nodeIndex] = "ERROR"));

  await Promise.allSettled(Object.values(roles));

  return roles;
}

module.exports = getNodesInfo;

const getRoleOfNode = async (validatorPublicKey) =>
  (await axios.post("https://monitor.incognito.org/pubkeystat/stat", { mpk: validatorPublicKey })).data[0].Role;
