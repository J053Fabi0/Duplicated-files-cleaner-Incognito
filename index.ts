import db from "./db/initDatabase.ts";
import constants from "./constants.ts";
import getNodesInfo from "./getNodesInfo.ts";
import getInstructions from "./utils/getInstructions.ts";
import { nodesDB } from "./db/collections/collections.ts";
import { docker, rm, cp, chown, getExtraFiles } from "./utils/commands.ts";

const { homePath } = constants;

try {
  console.log("Getting instructions.");
  const instructions = await getInstructions();
  console.log("Instructions:");
  console.log(instructions);

  console.group("\nGetting roles.");
  const roles = await getNodesInfo();
  console.table(roles);
  console.groupEnd();

  const allNodesIndex = nodesDB.find({}).map(({ index }) => index);

  console.group("\nStopping containers.");

  // Stop extra dockers
  if (constants.extraDockers instanceof Array)
    for (const extraDocker of constants.extraDockers) console.log(await docker(extraDocker, "stop"));
  // Stop nodes
  for (const nodeIndex of allNodesIndex)
    if (roles[nodeIndex] !== "COMMITTEE") {
      console.log(await docker(`inc_mainnet_${nodeIndex}`, "stop"));
    } else console.log(`Skipping node ${nodeIndex} because it's in committee.`);
  console.groupEnd();
  console.log();

  for (const { toNodesIndex, shardName, ...from } of instructions) {
    const fromNode = "fromNodeIndex" in from ? from.fromNodeIndex : from.fromPath;

    if (typeof fromNode === "number")
      if (roles[fromNode] === "COMMITTEE") {
        console.log(`Skipping ${shardName} because the fromNode ${fromNode} it's in committee.\n`);
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
      const fromNodePath =
        typeof fromNode === "number" ? `${homePath}/node_data_${fromNode}/mainnet/block/${shardName}` : fromNode;

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
  try {
    await chown(["incognito:incognito", homePath, "-R"]);
  } catch (e) {
    console.error(e);
  }

  console.group("\nStarting containers.");
  // Start extra dockers
  if (constants.extraDockers instanceof Array)
    for (const extraDocker of constants.extraDockers) console.log(await docker(extraDocker, "start"));
  // Start nodes
  for (const nodeIndex of allNodesIndex)
    if (roles[nodeIndex] !== "COMMITTEE") console.log(await docker(`inc_mainnet_${nodeIndex}`, "start"));

  console.groupEnd();

  console.log("\nDone!");

  saveDatabaseAndExit();
} catch (e) {
  console.error(e);
}

function saveDatabaseAndExit() {
  db.saveDatabase((err) => {
    if (err) console.error(err);
    process.exit(0);
  });
}
