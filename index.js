const { docker, rm, cp, chown, getExtraFiles } = require("./utils/commands");
const { homePath, instructions, publicKeys = [] } = require("./constants");
const { getNodeRole } = require("./utils/nodesRPCs");

const allImplicatedNodes = (() => {
  const toReturn = [];
  for (const { fromNodeIndex, toNodesIndex } of instructions)
    for (const node of [fromNodeIndex, ...toNodesIndex]) if (!toReturn.includes(node)) toReturn.push(node);

  return toReturn;
})();

1;
(async () => {
  try {
    console.group("Getting roles.");
    const roles = await getNodesRoles();
    console.table(roles);
    console.groupEnd();

    console.group("\nStopping containers.");
    for (const nodeIndex of allImplicatedNodes)
      if (roles[nodeIndex] !== 2) {
        console.log(await docker(["container", "stop", `inc_mainnet_${nodeIndex}`], (v) => v.split("\n")[0]));
      } else console.log(`Skipping node ${nodeIndex} because it's in committee.`);
    console.groupEnd();
    console.log();

    for (const { fromNodeIndex, toNodesIndex, shardName } of instructions) {
      if (roles[fromNodeIndex] === 2) {
        console.log(`Skipping ${shardName} because the fromNode ${fromNodeIndex} is in committee.\n`);
        continue;
      }
      console.group(shardName);

      for (const toNodeIndex of toNodesIndex) {
        if (roles[toNodeIndex] === 2) {
          console.log(`Skipping node ${toNodeIndex} because it's in committee.`);
          continue;
        }

        console.log("Prossesing node", toNodeIndex);

        const toNodePath = `${homePath}/node_data_${toNodeIndex}/mainnet/block/${shardName}`;
        const fromNodePath = `${homePath}/node_data_${fromNodeIndex}/mainnet/block/${shardName}`;

        // Create the hard links.
        await rm(["-rf", toNodePath]);
        await cp(["-al", fromNodePath, toNodePath]);

        // Copy those files that must not be linked for each node.
        const filesToCopy = await getExtraFiles(toNodePath);
        for (const fileToCopy of filesToCopy) {
          await rm([`${toNodePath}/${fileToCopy}`]);
          await cp([`${fromNodePath}/${fileToCopy}`, toNodePath]);
        }
      }

      console.groupEnd();
      console.log();
    }

    console.log("Making sure all files are editable to the incognito user.");
    await chown(["incognito:incognito", homePath, "-R"]);

    console.group("\nStarting containers.");
    for (const nodeIndex of allImplicatedNodes)
      console.log(await docker(["container", "start", `inc_mainnet_${nodeIndex}`], (v) => v.split("\n")[0]));
    console.groupEnd();

    console.log("\nDone!");
  } catch (e) {
    console.error(e);
  }
})();

async function getNodesRoles() {
  const roles = {};
  for (const nodeIndex of allImplicatedNodes)
    roles[nodeIndex] =
      typeof publicKeys[nodeIndex] === "string"
        ? getNodeRole(publicKeys[nodeIndex])
            .then((role) => (roles[nodeIndex] = role))
            .catch(() => (roles[nodeIndex] = -1))
        : -1;

  await Promise.allSettled(Object.values(roles));

  return roles;
}
