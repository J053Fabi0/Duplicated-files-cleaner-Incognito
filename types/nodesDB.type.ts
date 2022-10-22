import Shards from "./shards.type.ts";

export default interface NodesDB extends Partial<LokiObj> {
  index: number;
  shardID: Shards;
  shardSeed: boolean;
  beaconSeed: boolean;
  validatorPublicKey: string;
}
