import Error from '@huds0n/error';

export function makePromiseCancellable<T>(
  promise: Promise<T>,
): { cancellablePromise: Promise<T>; cancel: () => boolean } {
  let cancellable = true;

  const returnObj = { cancel: () => false, cancellablePromise: null as any };

  returnObj.cancellablePromise = new Promise<T>(async (resolve, reject) => {
    returnObj.cancel = () => {
      if (cancellable) {
        reject(
          new Error({
            code: 'PROMISE_CANCELLED',
            handled: true,
            message: 'Promise cancelled',
            name: 'Huds0n Error',
            severity: 'NONE',
          }),
        );
        return true;
      }
      return false;
    };

    resolve(await promise);
  }).finally(() => {
    cancellable = false;
  });

  return returnObj;
}

export function timeout(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), delay);
  });
}

export async function asyncMap<T = any, U = any>(
  array: T[],
  callback: (element: T, index: number, array: T[]) => Promise<U>,
  inParallel = true,
) {
  const l = array.length;

  if (inParallel) {
    const promises: Promise<U>[] = [];

    for (let i = 0; i < l; i++) {
      promises.push(callback(array[i], i, array));
    }

    return Promise.all(promises);
  }

  const results: U[] = [];

  for (let i = 0; i < l; i++) {
    results.push(await callback(array[i], i, array));
  }

  return results;
}

export async function asyncForEach<T = any>(
  array: T[],
  callback: (element: T, index: number, array: T[]) => Promise<any>,
  inParallel = true,
) {
  await asyncMap(array, callback, inParallel);
}
