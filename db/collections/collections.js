const initializeNodes = require("./initNodesCollections");
const db = require("../initDatabase");

const collections = [{ name: "nodes", initializer: initializeNodes }];

for (const { name, initializer = () => 1 } of collections) if (!db.getCollection(name)) initializer(db);

module.exports.nodesDB = db.getCollection("nodes");
