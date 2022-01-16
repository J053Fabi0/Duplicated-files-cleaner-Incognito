module.exports = {
  homePath: "/home/incognito",

  // Important to set these, as they will prevent this scrpit from stopping a node which is in committee.
  // They are optional; you can omit any or leave it as an empty object: {}.
  publicKeys: {
    0: "12kMqNK27szkzHo6bz3dvQ3zsZsDUUgaL8ZEB29jdvdUYcRgt2H",
    1: "12JgooXC1Cdn2XjhAGKuEL5eL7hN7JjbXvNe92GTMQHCuKcKYez",
    2: "154p5TvLzRAcjroEzwWjUDmsHLtAxDFBUEbnHeCsU21h138Z8u",
    3: "124Qiq8TtSe4rCiSbeGiLGvFqtsNbQ5tfWL5b9QVStzmEu8xUa5",
    4: "127FBw9prnkd9McgbMNAkVJ5LVR1Hc5xzW9iKG3J1HsaQLNAq2",
    5: "17qP9hd5tdKWTpubfQXPneBoMUJgTRkwJaNxuXv213xmCwNEyk",
  },

  // Add as many instructions as you need.
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
