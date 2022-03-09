const ON_DEATH = require("death");

let deathFunction = () => 1;

let hasAskedToStop = false;
ON_DEATH(() => {
  if (hasAskedToStop) return process.exit(0);
  hasAskedToStop = true;

  deathFunction();
});

module.exports = (fn) => (deathFunction = fn);
