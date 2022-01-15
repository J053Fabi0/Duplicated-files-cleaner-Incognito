const { spawn } = require("child_process");

module.exports = (command, args, parser = (d) => d) =>
  new Promise((res, rej) => {
    if (!(args instanceof Array)) args = [args];
    const commandSpawn = spawn(command, args);
    let hasError = false;

    // Errors
    let errors = "";
    commandSpawn.on("error", (error) => {
      hasError = true;
      errors += `error: ${error.message}`;
    });
    commandSpawn.stderr.on("data", (data) => {
      hasError = true;
      errors += `stderr: ${data}`;
    });

    // Data
    let result = "";
    commandSpawn.stdout.on("data", (data) => (result += data.toString()));

    commandSpawn.on("close", () => (hasError ? rej(errors) : res(parser(result))));
  });
