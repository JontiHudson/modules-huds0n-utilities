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
