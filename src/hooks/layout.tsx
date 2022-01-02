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
    significantChangePercent?: number;
  };

  export type LayoutRectangle = LayoutRectangleRN & { isInitialized: boolean };
  export type Layout = LayoutRectangle;
  export type Result = [Layout, OnLayoutFn];
}

function isSignificantChange(a: number, b = 0, percentage?: number) {
  if (!percentage) return true;

  const diff = a - b;
  if (diff === 0) return false;

  return ((diff > 0 ? diff : -diff) / b) * 100 > percentage;
}

export function useLayout({
  onInitialize,
  onLayout,
  significantChangePercent = 0.1,
}: useLayout.Options = {}): useLayout.Result {
  const [layout, setLayout] = useState<useLayout.Layout>({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    isInitialized: false,
  });

  const handleLayout = useCallback(
    (layoutChangeEvent: useLayout.LayoutChangeEvent) => {
      const {
        nativeEvent: { layout: newLayout },
      } = layoutChangeEvent;

      if (
        isSignificantChange(
          newLayout.width,
          layout?.width,
          significantChangePercent,
        ) ||
        isSignificantChange(
          newLayout.height,
          layout?.height,
          significantChangePercent,
        ) ||
        isSignificantChange(newLayout.x, layout?.x, significantChangePercent) ||
        isSignificantChange(newLayout.y, layout?.y, significantChangePercent)
      ) {
        if (!layout.isInitialized) {
          onInitialize?.(layoutChangeEvent);
        }

        setLayout({ ...newLayout, isInitialized: true });
        onLayout?.(layoutChangeEvent);
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
