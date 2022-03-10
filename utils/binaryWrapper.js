const spawnPromise = require("./spawnPromise");

module.exports =
  (binaryName, workingDirectory = __dirname) =>
  (args, parser = undefined) =>
    spawnPromise(workingDirectory ? `${workingDirectory}/${binaryName}` : binaryName, args, parser);
