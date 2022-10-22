import { sleep } from "sleep";

/**
 * Executes a function until it doesn't throw any error.
 * @param cb The function to try.
 * @param maxRetries It will attempt this number of times before failing. Default to -1 to infinite.
 * @param awaitTimeBetweenRetries In seconds. Default to 0.1.
 * @param onCatch A function that will be called every time the cb fails.
 * @returns The result of the function
 */
export default async function repeatUntilNoError<T>(
  cb: (() => T) | (() => Promise<T>),
  maxRetries = -1,
  awaitTimeBetweenRetries = 0.1,
  onCatch?: (error: unknown, i: number) => void
) {
  let i = 1;
  let error: unknown;
  if (maxRetries < 0) maxRetries = Infinity;
  let result: T | Promise<T> = undefined as unknown as T;

  do {
    try {
      result = cb();
      if (result instanceof Promise) result = await result;

      return result;
    } catch (e) {
      error = e;
      if (i < maxRetries) onCatch?.(e, i);
      await sleep(awaitTimeBetweenRetries);
    } finally {
      i++;
    }
  } while (i <= maxRetries);

  if (i <= maxRetries) throw error;

  return result;
}
