import db from "./db/initDatabase.ts";
import constants from "./constants.ts";
import getNodesStatus from "./utils/getNodesStatus.ts";
import getInstructions from "./utils/getInstructions.ts";
import { docker, rm, cp, chown, getExtraFiles } from "./utils/commands.ts";

const { validatorPublicKeys = {}, homePath } = constants;

try {
  console.log("Getting instructions.");
  const instructions = await getInstructions();
  console.log("Instructions:");
  console.log(instructions);

  console.group("\nGetting node info.");
  const nodesInfo = await getNodesStatus();
  console.table(nodesInfo);
  console.groupEnd();

  const allNodesIndex = Object.keys(validatorPublicKeys).map((nodeIndex) => Number(nodeIndex));

  console.group("\nStopping containers.");

  // Stop extra dockers
  if (constants.extraDockers instanceof Array) console.log(await docker(constants.extraDockers, "stop"));
  // Stop nodes
  const dockerNamesToManipulate = allNodesIndex
    .filter((i) => !nodesInfo[i].skip)
    .map((nodeIndex) => `inc_mainnet_${nodeIndex}`);
  console.log(await docker(dockerNamesToManipulate, "stop"));
  // Tell which nodes were skipped
  const nodesToSkip = allNodesIndex.filter((i) => nodesInfo[i].skip);
  for (const nodeToSkip of nodesToSkip)
    console.log(`Skipping node ${nodeToSkip} because it's in or about to be in committee.`);
  console.groupEnd();
  console.log();

  // Process instructionns
  for (const { toNodesIndex, shardName, ...from } of instructions) {
    const fromNode = "fromNodeIndex" in from ? from.fromNodeIndex : from.fromPath;

    if (typeof fromNode === "number")
      if (nodesInfo[fromNode].skip) {
        console.log(
          `Skipping ${shardName} because the fromNode ${fromNode} it's in or about to be in committee.\n`
        );
        continue;
      }
    console.group(shardName);

    for (const toNodeIndex of toNodesIndex) {
      if (nodesInfo[toNodeIndex].skip) {
        console.log(`Skipping node ${toNodeIndex} because it's in or about to be in committee.`);
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
        await rm(["-r", `${toNodePath}/${fileToCopy}`]);
        await cp(["-r", `${fromNodePath}/${fileToCopy}`, toNodePath]);
      }

      // Make sure all files are editable by thy incognito user
      await chown(["incognito:incognito", `${homePath}/node_data_${toNodeIndex}`, "-R"]);
    }

    console.groupEnd();
    console.log();
  }

  console.group("\nStarting containers.");
  // Start extra dockers
  if (constants.extraDockers instanceof Array) console.log(await docker(constants.extraDockers, "start"));
  // Start nodes
  console.log(await docker(dockerNamesToManipulate, "start"));

  console.groupEnd();

  console.log("\nDone!");

  saveDatabaseAndExit();
} catch (e) {
  console.error(e);
}

function saveDatabaseAndExit() {
  db.saveDatabase((err) => {
    if (err) console.error(err);
    Deno.exit(0);
  });
}
