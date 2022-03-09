const loki = require("lokijs");
const lfsa = require("../node_modules/lokijs/src/loki-fs-sync-adapter");

const adapter = new lfsa();
const dbOptions = { adapter, autoupdate: true };

const db = new loki("./db/database.db", dbOptions);

const autosave = () =>
  setTimeout(() => {
    db.saveDatabase((err) => {
      if (err) console.error(err);
      autosave();
    });
  }, 2_000);
autosave();

db.loadDatabase();

console.log("Database loaded.");

module.exports = db;
