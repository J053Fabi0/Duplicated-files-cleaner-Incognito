module.exports = {
  homePath: "/home/incognito",
  instructions: [
    {
      shardName: "beacon",
      fromNodeIndex: "0",
      toNodesIndex: ["1", "2", "3", "4", "5"],
    },
    {
      shardName: "shard5",
      fromNodeIndex: "0",
      toNodesIndex: ["1", "5"],
    },
    {
      shardName: "shard6",
      fromNodeIndex: "2",
      toNodesIndex: ["3"],
    },
  ],
};
