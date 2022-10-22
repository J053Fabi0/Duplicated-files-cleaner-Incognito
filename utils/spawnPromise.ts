import { readableStreamFromReader } from "streams";

export const spawnPromise = async <returnType>(
  command: string,
  args: string[] | number[] | string,
  parser: (d: string) => returnType = (d: string) => d as unknown as returnType
) => {
  if (!(args instanceof Array)) args = [args];
  args = args.map((a) => a.toString());

  // console.log(`${command} ${args.join(" ")}`);

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
