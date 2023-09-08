import { lodash as _ } from "lodash";

/**
 * Given an array of functions that resolve to a promise, return an iterable object that resolves them in chunks,
 * so that the can be iterated by chunks.
 */
export function* yieldPromisesFunctions<returnType>(promises: (() => Promise<returnType>)[], maxSimultaneous = 2) {
  const chunkedPr = _.chunk(promises, maxSimultaneous);
  for (const promisesToResolve of chunkedPr) yield Promise.allSettled(promisesToResolve.map((x) => x()));
}

/**
 * Given an iterable object with promises, awaits them and returns the result.
 */
export async function iteratePromisesYielded<returnType>(
  promises: Generator<Promise<PromiseSettledResult<returnType>[]>, void, unknown>,
  cb?: (resultOfChunk: PromiseSettledResult<returnType>[]) => void
) {
  const results = [];
  for await (const resultOfChunk of promises) {
    results.push(...resultOfChunk);
    cb?.(resultOfChunk);
  }
  return results;
}

/**
 * Given an array of functions that resolve to a promise, return an iterable object that resolves them in chunks,
 * so that the can be iterated by chunks. Then it iterates them and returns the result.
 * @param cb A callback that will be called every time a chunk is resolved.
 */
export default function iteratePromisesInChunks<returnType>(
  promises: (() => Promise<returnType>)[],
  maxSimultaneous = 2,
  cb?: (resultOfChunk: PromiseSettledResult<returnType>[]) => void
) {
  const yieldedPromises = yieldPromisesFunctions(promises, maxSimultaneous);
  return iteratePromisesYielded(yieldedPromises, cb);
}

// Example
// (async () => {
//   const sleep = require("util").promisify(setTimeout);
//   console.time("");
//   const p = yieldPromisesFunctions(new Array(5).fill(0).map((_, i) => () => sleep(1000, i)));
//   const pr = await iteratePromisesYielded(p);
//   console.timeEnd("");
//   console.log(pr);
// })();
// (async () => {
//   const sleep = require("util").promisify(setTimeout);
//   console.time("");
//   const pr = await iteratePromisesInChunks(
//     new Array(5).fill(0).map((_, i) => () => sleep(1000, i)),
//     2,
//     (a) => console.log(a)
//   );
//   console.timeEnd("");
//   console.log(pr);
// })();
