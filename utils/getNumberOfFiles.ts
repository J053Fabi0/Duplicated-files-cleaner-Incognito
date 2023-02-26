export default function getNumberOfFiles(path: string) {
  const dir = Deno.readDirSync(path);
  let i = 0;
  for (; dir[Symbol.iterator]().next().done !== true; i++);
  return i;
}
