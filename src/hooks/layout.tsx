import { useRef } from 'react';
import {
  Dimensions,
  LayoutChangeEvent as LayoutChangeEventRN,
  LayoutRectangle as LayoutRectangleRN,
} from 'react-native';

import { getOrientation } from '../layout';

import { useEffect, useState } from './lifecycle';
import { useCallback } from './memoize';

export namespace useLayout {
  export type LayoutChangeEvent = LayoutChangeEventRN;
  export type OnInitializeFn = (layoutChangeEvent: LayoutChangeEvent) => void;
  export type OnLayoutFn = (layoutChangeEvent: LayoutChangeEvent) => void;
  export type Options = {
    onInitialize?: OnInitializeFn;
    onLayout?: OnLayoutFn;
  };

  export type LayoutRectangle = LayoutRectangleRN;
  export type Layout = undefined | LayoutRectangle;
  export type Result = [Layout, OnLayoutFn];
}

function isSignificantChange(a: number, b = 0, percentage = 1) {
  const diff = a - b;
  if (diff === 0) {
    return false;
  }

  return ((diff > 0 ? diff : -diff) / b) * 100 > percentage;
}

export function useLayout({
  onInitialize,
  onLayout,
}: useLayout.Options = {}): useLayout.Result {
  const initialisedRef = useRef(false);
  const [layout, setLayout] = useState<useLayout.Layout>(undefined);

  const handleLayout = useCallback(
    (layoutChangeEvent: useLayout.LayoutChangeEvent) => {
      const {
        nativeEvent: { layout: newLayout },
      } = layoutChangeEvent;

      if (
        isSignificantChange(newLayout.width, layout?.width) ||
        isSignificantChange(newLayout.height, layout?.height) ||
        isSignificantChange(newLayout.x, layout?.x) ||
        isSignificantChange(newLayout.y, layout?.y)
      ) {
        setLayout(newLayout);
        onLayout?.(layoutChangeEvent);

        if (!initialisedRef.current) {
          initialisedRef.current = true;
          onInitialize?.(layoutChangeEvent);
        }
      }
    },
    [layout, onInitialize, onLayout],
  );

  return [layout, handleLayout];
}

export namespace useOrientation {
  export type Orientation = getOrientation.Orientation;
  export type OnChangeFn = (orientation: Orientation) => void;
  export type Options = {
    onChange?: OnChangeFn;
  };
}

export function useOrientation(
  options?: useOrientation.Options,
): useOrientation.Orientation {
  const [orientation, setOrientation] = useState(getOrientation);

  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = getOrientation();
      setOrientation(newOrientation);
      options?.onChange?.(newOrientation);
    };

    Dimensions.addEventListener('change', handleOrientationChange);

    return () =>
      Dimensions.removeEventListener('change', handleOrientationChange);
  }, [options?.onChange]);

  return orientation;
}
