const spawnPromise = require("./spawnPromise");

module.exports =
  (binaryName, workingDirectory = process.env.PWD) =>
  (args, parser = undefined) =>
    spawnPromise(workingDirectory ? `${workingDirectory}/${binaryName}` : binaryName, args, parser);
