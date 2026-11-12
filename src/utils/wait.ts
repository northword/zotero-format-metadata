/**
 * Wait until the condition is `true` or timeout.
 * The callback is triggered if condition returns `true`.
 * @param condition
 * @param callback
 * @param interval
 * @param timeout
 */
export function waitUntil(condition: () => boolean, callback: () => void, interval = 100, timeout = 10000) {
  const start = Date.now();
  const intervalId = ztoolkit.getGlobal("setInterval")(() => {
    if (condition()) {
      ztoolkit.getGlobal("clearInterval")(intervalId);
      callback();
    }
    else if (Date.now() - start > timeout) {
      ztoolkit.getGlobal("clearInterval")(intervalId);
    }
  }, interval);
}

/**
 * Wait async until the condition is `true` or timeout.
 * @param condition
 * @param interval
 * @param timeout
 */
export function waitUtilAsync(condition: () => boolean, interval = 100, timeout = 10000) {
  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    const intervalId = ztoolkit.getGlobal("setInterval")(() => {
      if (condition()) {
        ztoolkit.getGlobal("clearInterval")(intervalId);
        resolve();
      }
      else if (Date.now() - start > timeout) {
        ztoolkit.getGlobal("clearInterval")(intervalId);
        reject(new Error("timeout"));
      }
    }, interval);
  });
}

/**
 * Reject with the given message if the promise does not settle within `timeoutMs`.
 *
 * Implemented with `setTimeout` on purpose: `withTimeout` from es-toolkit v1.53+
 * relies on `AbortController`, which is not exposed in the plugin sandbox.
 * @see https://github.com/northword/zotero-format-metadata/issues/463
 */
export async function timeoutPromise<T>(promise: Promise<T>, timeoutMs: number, message = "Timeout"): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  try {
    // Race between the original promise and the timeout promise
    return await Promise.race([promise, timeoutPromise]);
  }
  finally {
    if (timeoutId !== undefined)
      clearTimeout(timeoutId);
  }
}
