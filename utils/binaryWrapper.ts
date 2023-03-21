import { join } from "../deps.ts";
import spawnPromise from "./spawnPromise.ts";

type BinaryWrapper = (
  binaryName: string,
  workingDirectory?: string
) => <returnType = string>(
  args: string | string[] | number[],
  parser?: (d: string) => returnType
) => Promise<returnType>;

/**
 * @param binaryName The name of the binary.
 * @param directoryPath The directory of the binary, if not in $PATH. You could use Deno.cwd().
 */
const binaryWrapper = (binaryName: string, directoryPath?: string) =>
  spawnPromise.bind(undefined, directoryPath ? join(directoryPath, binaryName) : binaryName);

export default binaryWrapper as BinaryWrapper;
