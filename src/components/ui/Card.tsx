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
} from '@/theme/tokens';

export interface CardProps {
  children: ReactNode;
  /** Defaults to the layout's card padding. */
  padding?: keyof typeof spacing;
  radius?: keyof typeof radius;
  /** `none` renders a flat, bordered surface; the others add a soft shadow. */
  elevation?: ShadowLevel | 'none';
  style?: StyleProp<ViewStyle>;
}

/** A soft mint surface with rounded corners. */
export function Card({
  children,
  padding,
  radius: radiusKey = 'lg',
  elevation = 'sm',
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
          backgroundColor: palette.surface,
          borderColor: palette.borderSubtle,
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
