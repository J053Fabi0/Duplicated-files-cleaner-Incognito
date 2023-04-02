import DuplicatedFilesCleaner from "./src/DuplicatedFilesCleaner.ts";
export default DuplicatedFilesCleaner;

export { default as spawnPromise } from "./utils/spawnPromise.ts";
export { default as binaryWrapper } from "./utils/binaryWrapper.ts";

export { copyFileOrDir } from "./src/copyData.ts";
export { shardsNames } from "./types/shards.type.ts";
export { default as getFiles } from "./utils/getFiles.ts";
export { dockerPs, docker, df } from "./utils/commands.ts";
export { default as normalizeShards } from "./utils/normalizeShards.ts";
export { default as repeatUntilNoError } from "./utils/repeatUntilNoError.ts";

// Types
export type { Info } from "./src/getInfo.ts";
export type { LDBFile } from "./utils/getFiles.ts";
export type { DockersStatus, DockerStatus } from "./utils/commands.ts";
export type { default as ShardsNumbers, ShardsNames, ShardsStr } from "./types/shards.type.ts";
export type { default as Constants, Instruction, ValidatorPublicKeys } from "./types/constants.type.ts";
