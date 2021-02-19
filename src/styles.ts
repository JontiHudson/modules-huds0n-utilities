import { PressableProps, StyleSheet } from 'react-native';
import TinyColor from 'tinycolor2';

import Error from '@huds0n/error';

export function flattenPressableStyle(
  styles: PressableProps['style'][],
): PressableProps['style'] {
  if (styles.some((style) => typeof style === 'function')) {
    // @ts-ignore
    return (pressableCallback) =>
      styles.reduce(
        (acc, current) =>
          StyleSheet.flatten([
            acc,
            typeof current === 'function'
              ? current(pressableCallback)
              : current,
          ]),
        {},
      );
  }

  return StyleSheet.flatten(styles);
}

/* eslint-disable no-bitwise */

export function getTinyColor(color?: string) {
  if (!color) return undefined;

  const tinyColor = TinyColor(color);

  if (!tinyColor.isValid()) {
    new Error({
      name: 'Huds0n Error',
      code: 'INVALID_COLOR',
      message: 'Color is invalid',
      severity: 'LOW',
      info: { color },
      handled: true,
    }).log();
  }

  return tinyColor;
}

export function lightenColor(color: string, amount?: number): string;
export function lightenColor(color?: undefined, amount?: number): undefined;
export function lightenColor(
  color?: string,
  amount?: number,
): string | undefined;
export function lightenColor(
  color?: string,
  amount: number = 20,
): string | undefined {
  return amount > 0
    ? getTinyColor(color)?.lighten(amount).toHex8String()
    : darkenColor(color, -amount);
}

export function darkenColor(color: string, amount?: number): string;
export function darkenColor(color: undefined, amount?: number): undefined;
export function darkenColor(
  color?: string,
  amount?: number,
): string | undefined;
export function darkenColor(color?: string, amount = 20): string | undefined {
  return amount > 0
    ? getTinyColor(color)?.darken(amount).toHex8String()
    : lightenColor(color, -amount);
}

export function addColorTransparency(color?: string, alpha = 0) {
  return getTinyColor(color)?.setAlpha(alpha).toHex8String();
}

export function colorIsDark(color?: string) {
  return getTinyColor(color)?.isDark();
}

export function multiplyDimension<T extends number | string | undefined>(
  value: T,
  multiplier: number,
): T {
  if (typeof value === 'number') {
    // @ts-ignore
    return (value * multiplier) as T;
  }

  if (typeof value === 'string') {
    try {
      // @ts-ignore
      return `${Number(value.slice(0, -1)) * multiplier}%` as T;
    } catch (e) {
      Error.transform(e, {
        name: 'Huds0n Error',
        code: 'INVALID_DIMENSION',
        message: 'Dimension cannot be multipled',
        severity: 'HIGH',
        info: { value, multiplier },
      });
    }
  }

  return value;
}
