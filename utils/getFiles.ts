const getFiles = (path: string) =>
  [...Deno.readDirSync(path)] // only get the .ldb files
    .filter((a) => a.name.endsWith(".ldb"))
    // add the number to the object
    .map((a) => Object.assign(a, { number: Number(a.name.substring(0, a.name.length - 4)) }))
    // sort by number from highest to lowest
    .sort((a, b) => b.number - a.number);

export default getFiles;
