import { Dimensions } from "react-native";

import { getOrientation } from "../layout";

import { useEffect, useState } from "./lifecycle";
import { useCallback } from "./memoize";

import type { Types } from "../types";

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
}: {
  onInitialize?: Types.OnInitializeLayout;
  onLayout?: Types.OnLayout;
  significantChangePercent?: number;
} = {}): [Types.LayoutRectangle, Types.OnLayout] {
  const [layout, setLayout] = useState<Types.LayoutRectangle>({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    isInitialized: false,
  });

  const handleLayout = useCallback(
    (layoutChangeEvent: Types.LayoutChangeEvent) => {
      const {
        nativeEvent: { layout: newLayout },
      } = layoutChangeEvent;

      if (
        isSignificantChange(
          newLayout.width,
          layout?.width,
          significantChangePercent
        ) ||
        isSignificantChange(
          newLayout.height,
          layout?.height,
          significantChangePercent
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
    [layout, onInitialize, onLayout]
  );

  return [layout, handleLayout];
}

export function useOrientation(options?: {
  onChange?: Types.OnOrientationChange;
}): Types.Orientation {
  const [orientation, setOrientation] = useState(getOrientation);

  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = getOrientation();
      setOrientation(newOrientation);
      options?.onChange?.(newOrientation);
    };

    Dimensions.addEventListener("change", handleOrientationChange);

    return () =>
      Dimensions.removeEventListener("change", handleOrientationChange);
  }, [options?.onChange]);

  return orientation;
}
