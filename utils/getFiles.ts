export type File = Deno.DirEntry & { number: number };

export default function getFiles(path: string) {
  const files = [...Deno.readDirSync(path)]
    // only get the .ldb files
    .filter((a) => a.name.endsWith(".ldb")) as File[];

  // add the number to the object
  for (const file of files) file.number = Number(file.name.substring(0, file.name.length - 4));

  // sort by number from highest to lowest
  return files.sort((a, b) => b.number - a.number);
}
