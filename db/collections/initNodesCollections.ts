import NodesDB from "../../types/nodesDB.type.ts";

const initNodesCollections = (db: Loki) =>
  db.addCollection<NodesDB>("nodes", { indices: ["validatorPublicKey", "shardID", "beaconSeed", "shardSeed"] });

export default initNodesCollections;
