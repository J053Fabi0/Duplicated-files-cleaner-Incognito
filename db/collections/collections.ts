import db from "../initDatabase.ts";
import NodesDB from "../../types/nodesDB.type.ts";
import initNodesCollections from "./initNodesCollections.ts";

const collections = [{ name: "nodes", initializer: initNodesCollections }];

for (const { name, initializer = () => 1 } of collections) if (!db.getCollection(name)) initializer(db);

export const nodesDB = db.getCollection<NodesDB>("nodes");
