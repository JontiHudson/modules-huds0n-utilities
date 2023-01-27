import { useCallback as useCallbackRN, useRef } from 'react';

import { useState } from './lifecycle';

export function useCallback<A extends any[], T>(
  callback: (...args: A) => T,
  dependencies: any[] = [],
) {
  return useCallbackRN(callback, dependencies);
}

export function useAsyncCallback<A extends any[], T>(
  asyncCallback: (...args: A) => T | Promise<T>,
  dependencies: any[] = [],
): [(...args: A) => Promise<T>, boolean] {
  const [isRunning, setIsRunning] = useState(false);
  const callback = useCallbackRN(asyncCallback, [...dependencies, isRunning]);

  async function runCallback(...args: A) {
    setIsRunning(true);

    const result = await Promise.resolve(callback(...args));

    setIsRunning(false);

    return result;
  }

  return [runCallback, isRunning];
}

export function useMemo<T>(memoFunction: () => T, dependencies: any[] = []): T {
  // eslint-disable-next-line no-null/no-null
  const resultRef = useRef<T | null>(null);
  // eslint-disable-next-line no-null/no-null
  const dependenciesRef = useRef<any[] | null>(null);

  const dependencyLength = dependencies.length;

  if (dependenciesRef.current?.length !== dependencyLength) {
    const result = memoFunction();

    resultRef.current = result;
    dependenciesRef.current = dependencies;

    return result;
  }

  for (let i = 0; i < dependencyLength; i++) {
    if (dependenciesRef.current[i] !== dependencies[i]) {
      const result = memoFunction();

      resultRef.current = result;
      dependenciesRef.current = dependencies;

      return result;
    }
  }

  return resultRef.current as T;
}
