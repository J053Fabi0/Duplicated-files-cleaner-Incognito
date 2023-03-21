type ShardsNumbers = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export default ShardsNumbers;
export type ShardsStr = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7";
export type ShardsNames =
  | "beacon"
  | "shard0"
  | "shard1"
  | "shard2"
  | "shard3"
  | "shard4"
  | "shard5"
  | "shard6"
  | "shard7";

export const shardsNames = [
  "beacon",
  "shard0",
  "shard1",
  "shard2",
  "shard3",
  "shard4",
  "shard5",
  "shard6",
  "shard7",
] as const;
