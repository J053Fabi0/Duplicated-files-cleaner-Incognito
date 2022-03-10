const loki = require("lokijs");
const lfsa = require("../node_modules/lokijs/src/loki-fs-sync-adapter");

const adapter = new lfsa();
const dbOptions = { adapter, autoupdate: true };

const db = new loki(require("path").join(__dirname, "db/database.db"), dbOptions);

db.loadDatabase();

console.log("Database loaded.");

module.exports = db;
