const binaryWrapper = require("./binaryWrapper");
const docker = binaryWrapper("docker", false);
const chown = binaryWrapper("chown", false);
const bash = binaryWrapper("bash", false);
const cp = binaryWrapper("cp", false);
const rm = binaryWrapper("rm", false);
const ls = binaryWrapper("ls", false);

module.exports.stopAllContainers = () =>
  bash(["-c", "docker container stop $(docker container ls -q --filter name=inc_mainnet_*)"]);

module.exports.docker = docker;
module.exports.chown = chown;
module.exports.cp = cp;
module.exports.rm = rm;

module.exports.getNodesIndexes = (homeDirectory = "/home/incognito") =>
  ls([homeDirectory], (v) =>
    v
      .split("\n")
      .filter((v) => v.startsWith("node_data_"))
      .map((v) => +v.substring(10))
      .sort((a, b) => a - b)
  );

module.exports.getExtraFiles = (nodePathToShard) =>
  ls([nodePathToShard], (v) =>
    v
      .split("\n")
      // Get rid of a last "\n" that always has nothing.
      .slice(0, -1)
      // Every file that doesn't end with '.ldb'.
      .filter((v) => v.endsWith(".ldb") === false)
  );
