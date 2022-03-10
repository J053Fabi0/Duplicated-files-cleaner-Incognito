const binaryWrapper = require("./binaryWrapper");
const docker = binaryWrapper("docker", "/bin");
const chown = binaryWrapper("chown", "/bin");
const cp = binaryWrapper("cp", "/bin");
const rm = binaryWrapper("rm", "/bin");
const ls = binaryWrapper("ls", "/bin");

module.exports.docker = docker;
module.exports.chown = chown;
module.exports.cp = cp;
module.exports.rm = rm;

module.exports.getExtraFiles = (nodePathToShard) =>
  ls([nodePathToShard], (v) =>
    v
      .split("\n")
      // Get rid of a last "\n" that always has nothing.
      .slice(0, -1)
      // Filter every file that doesn't end with '.ldb'.
      .filter((v) => v.endsWith(".ldb") === false)
  );
