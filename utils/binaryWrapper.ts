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
 * @param directory The directory of the binary, without trailing slash. You could use Deno.cwd()
 */
const binaryWrapper = (binaryName: string, directory?: string) =>
  spawnPromise.bind(undefined, directory ? `${directory}/${binaryName}` : binaryName);

export default binaryWrapper as BinaryWrapper;
