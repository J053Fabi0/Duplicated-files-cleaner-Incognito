const { docker, rm, cp, chown, getExtraFiles } = require("./utils/commands");
const { homePath, instructions } = require("./constants");

const allImplicatedNodes = (() => {
  const toReturn = [];
  for (const { fromNodeIndex, toNodesIndex } of instructions)
    for (const node of [fromNodeIndex, ...toNodesIndex]) if (!toReturn.includes(node)) toReturn.push(node);

  return toReturn;
})();

1;
(async () => {
  try {
    console.log("Stopping containers.");
    for (const nodeIndex of allImplicatedNodes)
      console.log(await docker(["container", "stop", `inc_mainnet_${nodeIndex}`], (v) => v.split("\n")[0]));
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

    console.log("Making sure all files are editable to the incognito user.");
    await chown(["incognito:incognito", homePath, "-R"]);

    console.log("\nStarting containers again");
    for (const nodeIndex of allImplicatedNodes)
      console.log(await docker(["container", "start", `inc_mainnet_${nodeIndex}`], (v) => v.split("\n")[0]));

    console.log("\nDone!");
  } catch (e) {
    console.error(e);
  }
})();
