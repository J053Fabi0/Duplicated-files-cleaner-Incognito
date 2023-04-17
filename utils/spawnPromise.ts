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

  const process = Deno.run({ cmd: [command, ...args], stderr: "piped", stdout: "piped" });

  const stderr: string[] = [];
  const decoder = new TextDecoder();
  readableStreamFromReader(process.stderr).pipeTo(
    new WritableStream({
      write(chunk) {
        const decoded = decoder.decode(chunk).split(/\r?\n/).filter(Boolean);
        for (const line of decoded) stderr.push(line);
      },
    })
  );

  const stdout = new TextDecoder().decode(await process.output());

  if (stderr.length > 0) throw new Error(stderr.join("\n"));

  return parser(stdout);
};

export default spawnPromise;
