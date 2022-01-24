module.exports = {
  homePath: "/home/incognito",

  // Important to set these, as they will prevent this scrpit from stopping a node which is in committee.
  // They are optional; you can omit any or leave it as an empty object: {}.
  publicKeys: {
    0: "12kMqNK27szkzHo6bz3dvQ3zsZsDUUgaL8ZEB29jdvdUYcRgt2H",
    1: "12JgooXC1Cdn2XjhAGKuEL5eL7hN7JjbXvNe92GTMQHCuKcKYez",
    2: "154p5TvLzRAcjroEzwWjUDmsHLtAxDFBUEbnHeCsU21h138Z8u",
  },

  // Add as many instructions as you need.
  instructions: [
    {
      // This will copy the beacon folder from node 0 to nodes 1 and 2.
      shardName: "beacon",
      fromNodeIndex: "0",
      toNodesIndex: ["1", "2"],
    },
    {
      // Since nodes 1 and 2 use shard5, one can copy that folder from node 1 to 2.
      shardName: "shard5",
      fromNodeIndex: "1",
      toNodesIndex: ["2"],
    },
  ],
};
