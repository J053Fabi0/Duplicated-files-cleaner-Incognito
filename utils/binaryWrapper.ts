import spawnPromise from "./spawnPromise.ts";

type BinaryWrapper = (
  binaryName: string,
  workingDirectory?: string
) => <returnType>(args: string | string[] | number[], parser?: (d: string) => returnType) => Promise<returnType>;

const binaryWrapper = (binaryName: string, workingDirectory = Deno.cwd()) =>
  spawnPromise.bind(undefined, `${workingDirectory}/${binaryName}`);

export default binaryWrapper as BinaryWrapper;
