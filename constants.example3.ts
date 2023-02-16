import Constants from "./types/constants.type.ts";

const constants: Constants = {
  homePath: "/home/incognito",
  // If the number of epochs to the next event is equal or less than this number and the role is PENDING, the node will be skipped
  maxEpochsToNextEvent: 3,

  // The key is the index they occupy as a docker container.
  // The value is the validator public key.
  validatorPublicKeys: {
    0: "14nUEc4Yz5baih5bGgkTpemK2WUaA7LjCsGzZBgSSLTUypsya2hfPNVK1GjB8rT2mKRa42E1KcWi1X1u5xvxSTra8zopir3TXycSA3d1wKxDPTVZiqQCi5q39f49yCFQtTyfnL47BoB1W2bGQckC6fNwv5rTN5fz5jpr5EmoiRhB6MU4EPjrF",
    1: "1BoLvywGDC8TUxx4aMQ5fwKhqa4zgDKMQYwLLbLeX53v6xGXYC4k3WnJvakTeKdbkHDcgD6Z9eMKhow85AFoiE3t1XKrimbBH4wEbMYqCBRRJ2bAkFK1cLYczB91iFbxfuMAE45AyPPJirYks2ZEJA8aZnrg6wtj7vMBynMX11qpxB6yZw8XU",
  },

  extraDockers: ["inc_mainnet_fullnode"],
  instructions: [
    {
      shardName: "beacon",
      toNodesIndex: [0, 1],
      fromPath: "/home/incognito/fullnode/mainnet/block/beacon",
    },
    {
      shardName: "shard1",
      toNodesIndex: [0],
      fromPath: "/home/incognito/fullnode/mainnet/block/shard1",
    },
    {
      shardName: "shard3",
      toNodesIndex: [1],
      fromPath: "/home/incognito/fullnode/mainnet/block/shard3",
    },
  ],
};

export default constants;
