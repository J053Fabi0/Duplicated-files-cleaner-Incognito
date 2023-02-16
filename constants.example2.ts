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
    2: "1Ehsgg9AsFp1Hwisv49XmAwNjV5MrnBbhGKjk3Vm7Vu7tWs2fX8dmJRTjAc6xPzbMmJYWfEvmqJVt9kia85yFU9gdZ9habq7RdmFs8oJ4d63ubiZXnFrNKABxbwRX2TEUYrpDWr4pTr2J2Q1jMvBkUdSh9knTZHQNThHbb43MzdxHbThAxVPP",
  },

  instructions: [
    {
      shardName: "beacon",
      toNodesIndex: [0, 1],
      fromNodeIndex: 2,
    },
    {
      shardName: "shard1",
      toNodesIndex: [0, 1],
      fromNodeIndex: 2,
    },
  ],
};

export default constants;
