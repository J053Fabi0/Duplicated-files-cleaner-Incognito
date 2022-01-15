const { getNodesIndexes, stopAllContainers, docker, rm, cp, chown, getExtraFiles } = require("./utils/commands");
const { homePath, instructions } = require("./constants");

1;
(async () => {
  try {
    console.log("Stopping containers.");
    try {
      console.log(await stopAllContainers());
    } catch (_) {
      console.log("No containers active. Skipping this step.");
    }
    console.log();

    for (const { fromNodeIndex, toNodesIndex, shardName } of instructions) {
      console.group(shardName);

      for (const toNodeIndex of toNodesIndex) {
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

    console.log("\nMaking sure all files are editable to the incognito user.");
    await chown(["incognito:incognito", homePath, "-R"]);

    console.log("\nStarting containers again");
    const allNodesIndexes = await getNodesIndexes();
    for (const nodeIndex of allNodesIndexes)
      console.log(await docker(["container", "start", `inc_mainnet_${nodeIndex}`], (v) => v.split("\n")[0]));
  } catch (e) {
    console.error(e);
  }
})();
