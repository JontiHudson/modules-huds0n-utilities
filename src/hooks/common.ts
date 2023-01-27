import { useImperativeHandle, useRef } from 'react';
import { Animated } from 'react-native';

import Huds0nError from '@huds0n/error';
import { useEffect } from './lifecycle';
import { useCallback } from './memoize';

export function usePrev<T>(value: T) {
  const prevRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    prevRef.current = value;
  }, [value]);

  return prevRef.current;
}

export function useKeyExtractor(key: string) {
  return useCallback((item: any) => {
    try {
      return item[key].toString();
    } catch (error) {
      throw Huds0nError.create({
        name: 'Huds0n Error',
        code: 'KEY_EXTRACTOR_ERROR',
        message: 'Unable to extract key from item',
        severity: 'WARN',
        info: { item, key },
        from: error,
      });
    }
  });
}

export function useId(name: string) {
  return useRef(Symbol(name)).current;
}

export function useCopyRef<T>(ref: React.Ref<T>) {
  // eslint-disable-next-line no-null/no-null
  const copiedRef = useRef<T>(null);
  useImperativeHandle(ref, () => copiedRef.current as T);

  return copiedRef;
}

export function useAnimatedValue(initialValue = 0) {
  const ref = useRef(new Animated.Value(initialValue));

  return ref.current;
}

export function useAnimatedCurrentValue(animatedValue: Animated.Value) {
  // _value not typed
  const ref = useRef<number>((animatedValue as any)._value || 0);

  useEffect(
    () => {
      const id = animatedValue.addListener(
        ({ value }) => (ref.current = value),
      );

      return () => {
        animatedValue.removeListener(id);
      };
    },
    [],
    { layout: 'BEFORE' },
  );

  return ref;
}
