import constants from "../constants.ts";
import { NodeStatus } from "./getNodesStatus.ts";
const { maxEpochsToNextEvent = 3 } = constants;

const shouldNodeBeSkipped = (nodeInfo: Omit<NodeStatus, "skip">) =>
  nodeInfo.role === "COMMITTEE" ||
  (nodeInfo.role === "PENDING" && nodeInfo.epochsToNextEvent <= maxEpochsToNextEvent);

export default shouldNodeBeSkipped;
