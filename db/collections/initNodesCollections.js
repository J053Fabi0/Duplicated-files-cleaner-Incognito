module.exports = (db) => {
  db.addCollection("nodes", { indices: ["validatorPublicKey", "shardID", "beaconSeed", "shardSeed"] });
};

/*
  validatorPublicKey: string,
  shardID: 0 ... 9,
  index: number,
  shardSeed: boolean,
  beaconSeed: boolean,
*/
