const db = require("./db/initDatabase");
const { homePath } = require("./constants");
const getNodesInfo = require("./getNodesInfo");
const getInstructions = require("./utils/getInstructions");
const { nodesDB } = require("./db/collections/collections");
const { docker, rm, cp, chown, getExtraFiles } = require("./utils/commands");

1;
(async () => {
  try {
    console.log("Getting instructions.");
    const instructions = await getInstructions();
    console.log(instructions);
    return;

    console.group("\nGetting roles.");
    const roles = await getNodesInfo();
    console.table(roles);
    console.groupEnd();

    const allNodesIndex = nodesDB.find({}).map(({ index }) => index);

    console.group("\nStopping containers.");
    for (const nodeIndex of allNodesIndex)
      if (roles[nodeIndex] !== "COMMITTEE") {
        console.log(await docker(["container", "stop", `inc_mainnet_${nodeIndex}`], (v) => v.split("\n")[0]));
      } else console.log(`Skipping node ${nodeIndex} because it's in committee.`);
    console.groupEnd();
    console.log();

    for (const { fromNodeIndex, toNodesIndex, shardName } of instructions) {
      if (roles[fromNodeIndex] === "COMMITTEE") {
        console.log(`Skipping ${shardName} because the fromNode ${fromNodeIndex} it's in committee.\n`);
        continue;
      }
      console.group(shardName);

      for (const toNodeIndex of toNodesIndex) {
        if (roles[toNodeIndex] === "COMMITTEE") {
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
    for (const nodeIndex of allNodesIndex)
      console.log(await docker(["container", "start", `inc_mainnet_${nodeIndex}`], (v) => v.split("\n")[0]));
    console.groupEnd();

    console.log("\nDone!");

    saveDatabaseAndExit();
  } catch (e) {
    console.error(e);
  }
})();

require("./utils/customDeath")(saveDatabaseAndExit);
function saveDatabaseAndExit() {
  db.saveDatabase((err) => {
    if (err) console.error(err);
    process.exit(0);
  });
}
