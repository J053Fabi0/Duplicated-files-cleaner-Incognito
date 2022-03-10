const spawnPromise = require("./spawnPromise");
const path = require("path");

module.exports =
  (binaryName, workingDirectory = path.join(__dirname, "..")) =>
  (args, parser = undefined) =>
    spawnPromise(workingDirectory ? `${workingDirectory}/${binaryName}` : binaryName, args, parser);
