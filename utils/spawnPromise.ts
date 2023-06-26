import { readableStreamFromReader } from "../deps.ts";

/**
 * Spawns a command and returns the output.
 * @param command The command to spawn.
 * @param args The arguments to pass to the command as an array.
 * @param parser The parser to parse the output of the command. Defaults to no parsing.
 * @returns The parsed output of the command.
 */
const spawnPromise = async <returnType>(
  command: string,
  args: string[] | number[] | string,
  parser: (o: string) => returnType = (o: string) => o as unknown as returnType
) => {
  if (!(args instanceof Array)) args = [args];
  args = args.map((a) => a.toString());

  const process = new Deno.Command(command, {
    args,
    stderr: "piped",
    stdout: "piped",
  });

  const output = await process.output();

  if (output.success) return parser(new TextDecoder().decode(output.stdout));
  else throw new Error(new TextDecoder().decode(output.stderr));
};

export default spawnPromise;
