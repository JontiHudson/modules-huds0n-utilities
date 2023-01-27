import {
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import TinyColor from 'tinycolor2';

import Huds0nError from '@huds0n/error';

export function flattenPressableStyle(
  styles: PressableProps['style'][],
): PressableProps['style'] {
  if (styles.some((style) => typeof style === 'function')) {
    return (pressableCallback: PressableStateCallbackType) => {
      return styles.reduce(
        (acc, current) =>
          StyleSheet.flatten([
            acc,
            typeof current === 'function'
              ? current(pressableCallback)
              : current,
          ]),
        {},
      ) as StyleProp<ViewStyle>;
    };
  }

  return StyleSheet.flatten(styles);
}

export function getTinyColor(color?: string) {
  if (!color) return undefined;

  const tinyColor = TinyColor(color);

  if (!tinyColor.isValid()) {
    Huds0nError.create({
      name: 'Huds0n Error',
      code: 'INVALID_COLOR',
      message: 'Color is invalid',
      severity: 'WARN',
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
export function lightenColor(color?: string, amount = 20): string | undefined {
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
