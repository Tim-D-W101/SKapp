import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  layout,
  radius,
  shadows,
  sizes,
  spacing,
  useColors,
  type ShadowLevel,
  type TintName,
} from '@/theme/tokens';

export interface CardProps {
  children: ReactNode;
  /** Defaults to the layout's card padding. */
  padding?: keyof typeof spacing;
  radius?: keyof typeof radius;
  /** `none` renders a flat, bordered surface; the others add a soft shadow. */
  elevation?: ShadowLevel | 'none';
  /**
   * Gives the card one of the supporting colours' soft backgrounds, by what
   * it shows (see TintName). Without one, it's the warm cream surface.
   */
  tint?: TintName;
  style?: StyleProp<ViewStyle>;
}

/** A soft surface with rounded corners: warm cream, or the soft background of its tint. */
export function Card({
  children,
  padding,
  radius: radiusKey = 'lg',
  elevation = 'sm',
  tint,
  style,
}: CardProps) {
  const palette = useColors();
  const flat = elevation === 'none';

  return (
    <View
      style={[
        styles.base,
        {
          padding: padding ? spacing[padding] : layout.cardPadding,
          borderRadius: radius[radiusKey],
          backgroundColor: tint ? palette.tints[tint].soft : palette.surface,
          // A tinted card is set apart by its colour; the border keeps its size, unseen.
          borderColor: tint ? palette.tints[tint].soft : palette.borderSubtle,
        },
        flat ? null : shadows[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: sizes.borderWidth,
  },
});
