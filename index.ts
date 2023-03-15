import run from "./run.ts";

await run();

//   try {
//     console.group("Getting nodes' information.");
//     const dockerStatus = flags.keepStatus && !flags.onlyOffline ? await dockerPs() : {};
//     const nodesStatus = await getNodesStatus();
//     console.table(nodesStatus);
//     console.groupEnd();

//     console.group("\nGetting instructions.");
//     const instructions = await getInstructions(nodesStatus);
//     console.dir(instructions, { depth: 100 });
//     console.groupEnd();

//     console.group("\nStopping containers.");

//     // Stop extra dockers
//     if (constants.extraDockers instanceof Array) console.log(await docker(constants.extraDockers, "stop"));
//     // Stop nodes
//     const allNodesIndex = Object.keys(validatorPublicKeys).map((nodeIndex) => Number(nodeIndex));
//     const dockerNamesToManipulate = allNodesIndex
//       .filter((i) => !nodesStatus[i].skip)
//       .map((nodeIndex) => `inc_mainnet_${nodeIndex}`);
//     console.log(await docker(dockerNamesToManipulate, "stop"));
//     // Tell which nodes were skipped
//     const nodesToSkip = allNodesIndex.filter((i) => nodesStatus[i].skip);
//     const skippingExplanation = flags.onlyOffline ? "it's online" : "it's in or about to be in committee";
//     for (const nodeToSkip of nodesToSkip)
//       console.log(`Skipping node ${nodeToSkip} because ${skippingExplanation}.`);
//     console.groupEnd();
//     console.log();

//     // Process instructionns
//     for (const { toNodesIndex, shardName, ...from } of instructions) {
//       const fromNode = "fromNodeIndex" in from ? from.fromNodeIndex : from.fromPath;

//       if (typeof fromNode === "number")
//         if (nodesStatus[fromNode].skip) {
//           console.log(`Skipping ${shardName} because the fromNode ${fromNode} ${skippingExplanation}.\n`);
//           continue;
//         }
//       console.group(shardName);

//       for (const toNodeIndex of toNodesIndex) {
//         if (nodesStatus[toNodeIndex].skip) {
//           console.log(`Skipping node ${toNodeIndex} because ${skippingExplanation}.`);
//           continue;
//         }

//         console.log("Prossesing node", toNodeIndex);

//         const toNodePath = `${homePath}/node_data_${toNodeIndex}/mainnet/block/${shardName}`;
//         const fromNodePath =
//           typeof fromNode === "number" ? `${homePath}/node_data_${fromNode}/mainnet/block/${shardName}` : fromNode;

//         // Create the hard links.
//         await rm(["-rf", toNodePath]);
//         await cp(["-al", fromNodePath, toNodePath]);

//         // Copy those files that must not be linked for each node.
//         const filesToCopy = await getExtraFiles(toNodePath);
//         for (const fileToCopy of filesToCopy) {
//           await rm(["-r", `${toNodePath}/${fileToCopy}`]);
//           await cp(["-r", `${fromNodePath}/${fileToCopy}`, toNodePath]);
//         }

//         // Make sure all files are editable by thy incognito user
//         await chown(["incognito:incognito", `${homePath}/node_data_${toNodeIndex}`, "-R"]);
//       }

//       console.groupEnd();
//       console.log();
//     }

//     console.group("\nStarting containers.");

//     // Start extra dockers
//     if (constants.extraDockers instanceof Array) console.log(await docker(constants.extraDockers, "start"));

//     // Start nodes if not in offline mode
//     if (!flags.onlyOffline) {
//       const dockersToStart = flags.keepStatus
//         ? // Only start the nodes that were online before the script started.
//           dockerNamesToManipulate.filter((name) => dockerStatus[name] === "ONLINE")
//         : // Start all nodes regardless of their status before the script started.
//           dockerNamesToManipulate;
//       if (dockersToStart.length > 0) console.log(await docker(dockersToStart, "start"));
//     }

//     console.groupEnd();

//     console.log("\nDone!");

//     saveDatabaseAndExit();
//   } catch (e) {
//     console.error(e);
//   }

// function saveDatabaseAndExit() {
//   db.saveDatabase((err) => {
//     if (err) console.error(err);
//     Deno.exit(0);
//   });
// }
