const { getNodesIndexes, stopAllContainers, docker, rm, cp, chown, getExtraFiles } = require("./utils/commands");
const { homePath, shardNames } = require("./constants");

1;
(async () => {
  try {
    const [fromNodeIndex, ...toNodesIndex] = await getNodesIndexes();

    console.log("Stopping containers.");
    try {
      console.log(await stopAllContainers());
    } catch (_) {
      console.log("No containers active. Skipping this step.");
    }
    console.log();

    for (const toNodeIndex of toNodesIndex) {
      console.log("Prossesing node", toNodeIndex);

      for (const shardName of shardNames) {
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
    }

    console.log("\nMake sure all files are editable to the incognito user.");
    await chown(["incognito:incognito", homePath, "-R"]);

    console.log("\nStarting containers again");
    for (const nodeIndex of [fromNodeIndex, ...toNodesIndex])
      console.log(await docker(["container", "start", `inc_mainnet_${nodeIndex}`], (v) => v.split("\n")[0]));
  } catch (e) {
    console.error(e);
  }
})();
