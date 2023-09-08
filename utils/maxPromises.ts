/**
 * Resolves promises in parallel, but only a maximum number of promises at a time.
 * @param promises
 * @param maxSimultaneous Default is 2
 */
export default async function maxPromises<returnType>(
  promises: (() => Promise<returnType>)[],
  maxSimultaneous = 2
): Promise<returnType[]> {
  let promisesResolving = 0;
  const results: returnType[] = new Array(promises.length);
  const promisesToResolve = promises.slice();

  // define a function that resolves all promises in the queue
  async function resolveNext() {
    if (promisesResolving >= maxSimultaneous) return;

    const position = promises.findIndex((p) => p === promisesToResolve[0]);
    const promise = promisesToResolve.shift();
    if (!promise) return;

    promisesResolving++;

    await Promise.all([
      resolveNext(), // resolve next promise if possible
      (async () => {
        try {
          results[position] = await promise();
        } catch (e) {
          throw e;
        } finally {
          promisesResolving--;
          await resolveNext(); // resolve next promise if possible
        }
      })(),
    ]);
  }

  // start resolving promises until there are no more
  await resolveNext();

  return results;
}
