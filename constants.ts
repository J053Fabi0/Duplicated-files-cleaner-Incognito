import Constants from "./types/constants.type.ts";

const constants: Constants = {
  homePath: "/home/incognito",

  // The key is the index they occupy as a docker container.
  // The value is the validator public key.
  validatorPublicKeys: {
    0: "14nUEc4Yz5baih5bGgkTpemK2WUaA7LjCsGzZBgSSLTUypsya2hfPNVK1GjB8rT2mKRa42E1KcWi1X1u5xvxSTra8zopir3TXycSA3d1wKxDPTVZiqQCi5q39f49yCFQtTyfnL47BoB1W2bGQckC6fNwv5rTN5fz5jpr5EmoiRhB6MU4EPjrF",
    1: "1BoLvywGDC8TUxx4aMQ5fwKhqa4zgDKMQYwLLbLeX53v6xGXYC4k3WnJvakTeKdbkHDcgD6Z9eMKhow85AFoiE3t1XKrimbBH4wEbMYqCBRRJ2bAkFK1cLYczB91iFbxfuMAE45AyPPJirYks2ZEJA8aZnrg6wtj7vMBynMX11qpxB6yZw8XU",
    2: "1Ehsgg9AsFp1Hwisv49XmAwNjV5MrnBbhGKjk3Vm7Vu7tWs2fX8dmJRTjAc6xPzbMmJYWfEvmqJVt9kia85yFU9gdZ9habq7RdmFs8oJ4d63ubiZXnFrNKABxbwRX2TEUYrpDWr4pTr2J2Q1jMvBkUdSh9knTZHQNThHbb43MzdxHbThAxVPP",
    3: "1NWTg33BhfHQtG2gZXc3T7HK2kAM1zPtSjDfTuybEvBktsHhyEP9uN3stfLFGHdu2MPCNudcz21r84NKr7spNhRUQagRRENA4RXDDGADWHZhrF3dj7FB5igdBPMkWLVu8QgLSenrMBx6fVrHU6dKvnXsu8xHe7LE4X7SQPBNHu5GRxxLx8vka",
    4: "15dYRkqW9UFc9yJ43q88Hj9bFqXdQRUTXQtf7d3NnnBajnYn5Tyw9MGPBKMCd5xyBinpiFurxmFa7EcxxrdvmCvLwqNgDK6wtKaPtxz6FJdhmaMjpv7Ehsg3XTAz6gJWaHcUk6mF95cSVZP5WdyHWtMQAUAqgYNS8b46KsrphD9PCtQPdgTAY",
    5: "1A1Yfcq9MhrFfbVAQKG5BigUsD9EtpgPCoGNMbqqjKr143azVoMAeAvduMcZjdd5FMw3hvpu5ah8Gxj5H3MfzSw9wcfdrd6mEBWVYRUJLUmeuEXM78vUcQHWSHYk3DmyVY39xCq5ohTKd7zq8ukqhcLRjk5TouXQevuEbaGrJqgXVMpikUujt",
    6: "18r4KwUYjwpZuNVQtpwf7s6qzFSvjMT1ucLVH1oksWMYvUcJt9xgDHtgsvdQ7FUrj5cuTthrS29RwTFQTW4bqMEgY2SmTsFmuPxsDGRJ2a9nKtaGQWKhBH2RpYDENVpmKi6EKXqHjGFnayg1ixEKSmsW57DPkCSoPmcTUrBBgmyXRoY8szZ1U",
    7: "19hBFE5h4H298fC4DgRKgjRoq8KNBmpiTDchaBuwGkixd8n9iic4BxTCfL2QDK83fMgiA9xqB1bZG1BcA5PbUZYcUPkmpHVocGXh1cY5VQDjSRMT9ByzvSyoWVM9kCNZArTGibtGEtHJ4WGqK3mbYBfe1QseZpzvb5NQULrH2AhdzZpE5fzM9",
    8: "1BHp9z85ZJabA4bhxdZPUaqo4ajFQwooYyf7eGicrzuBPt6Wg1xA9YCwgphWthBsRj9F7QnM1guZhNp2hSyERim62xUNqdeMEv3NZqwgB5LTw2t5zW6waAQrSYy9AguTz8WBe4kYuBk7U5jqceYwGn2MEyy2sX9PMvPeYQCxKuuhYgY94cLFE",
  },

  instructions: [
    {
      shardName: "beacon",
      toNodesIndex: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      fromPath: "/home/incognito/fullnode/mainnet/block/beacon",
    },
    {
      shardName: "shard1",
      toNodesIndex: [0, 2, 8],
      fromPath: "/home/incognito/fullnode/mainnet/block/shard1",
    },
    {
      shardName: "shard3",
      toNodesIndex: [3, 6],
      fromPath: "/home/incognito/fullnode/mainnet/block/shard3",
    },
    {
      shardName: "shard5",
      toNodesIndex: [1, 5],
      fromPath: "/home/incognito/fullnode/mainnet/block/shard5",
    },
    {
      shardName: "shard7",
      toNodesIndex: [4, 7],
      fromPath: "/home/incognito/fullnode/mainnet/block/shard7",
    },
  ],
};

export default constants;
