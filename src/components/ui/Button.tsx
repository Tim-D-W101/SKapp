import { useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { hapticImpact } from '@/lib/haptics';
import {
  motion,
  opacity,
  radius,
  shadows,
  sizes,
  spacing,
  useColors,
  type ColorName,
  type ColorPalette,
  type TypographyVariant,
} from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/** `onBrand` is the main action on a brand-teal panel, such as "Scan my skin" on Home's hero. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'onBrand';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner in place of the label and ignores presses. */
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leadingIcon?: IconName;
  /** Defaults to `label`. Set it when the label alone would be ambiguous out of context. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const HORIZONTAL_PADDING: Record<ButtonSize, number> = {
  sm: spacing.md,
  md: spacing.lg,
  lg: spacing.xl,
};

const ICON_SIZE: Record<ButtonSize, number> = {
  sm: sizes.icon.sm,
  md: sizes.icon.md,
  lg: sizes.icon.md,
};

const LABEL_VARIANT: Record<ButtonSize, TypographyVariant> = {
  sm: 'label',
  md: 'label',
  lg: 'labelLarge',
};

/**
 * A label may wrap onto a second line rather than be cut off, which only
 * happens at the phone's largest font sizes. The button grows to fit.
 */
const LABEL_LINES = 2;

interface VariantColors {
  background: string;
  border: string;
  text: ColorName;
}

function variantColors(variant: ButtonVariant, pressed: boolean, palette: ColorPalette) {
  const map: Record<ButtonVariant, VariantColors> = {
    primary: {
      background: pressed ? palette.accentPressed : palette.accent,
      border: 'transparent',
      text: 'textInverse',
    },
    secondary: {
      background: pressed ? palette.accentSubtle : palette.surfaceElevated,
      border: palette.accent,
      text: 'accentText',
    },
    ghost: {
      background: pressed ? palette.accentSubtle : 'transparent',
      border: 'transparent',
      text: 'accentText',
    },
    destructive: {
      background: palette.danger,
      border: 'transparent',
      text: 'textInverse',
    },
    onBrand: {
      background: pressed ? palette.brandActionPressed : palette.brandAction,
      border: 'transparent',
      text: 'onBrandAction',
    },
  };
  return map[variant];
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leadingIcon,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const palette = useColors();
  const [scale] = useState(() => new Animated.Value(1));
  const inactive = disabled || loading;
  const height = sizes.control[size];
  const verticalSlop = Math.max(0, (sizes.minTouchTarget - height) / 2);

  const animateTo = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: motion.duration.fast,
      easing: Easing.bezier(...motion.easing.standard),
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    hapticImpact();
    onPress();
  };

  return (
    <Animated.View
      style={[
        fullWidth ? styles.fullWidth : styles.intrinsic,
        { transform: [{ scale }], opacity: disabled ? opacity.disabled : 1 },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={() => animateTo(motion.pressScale)}
        onPressOut={() => animateTo(1)}
        disabled={inactive}
        hitSlop={{ top: verticalSlop, bottom: verticalSlop }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: inactive, busy: loading }}
      >
        {({ pressed }) => {
          const colors = variantColors(variant, pressed, palette);
          return (
            <View
              style={[
                styles.base,
                {
                  minHeight: height,
                  paddingHorizontal: HORIZONTAL_PADDING[size],
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
                // A soft lift on the main action, so it reads as the one to tap.
                variant === 'primary' && !disabled ? shadows.md : null,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={palette[colors.text]} />
              ) : (
                <>
                  {leadingIcon ? (
                    <Icon name={leadingIcon} size={ICON_SIZE[size]} color={colors.text} />
                  ) : null}
                  <Text
                    variant={LABEL_VARIANT[size]}
                    color={colors.text}
                    align="center"
                    numberOfLines={LABEL_LINES}
                    style={styles.label}
                  >
                    {label}
                  </Text>
                </>
              )}
            </View>
          );
        }}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  intrinsic: {
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    // Every variant has the same border width, so they all line up at one height.
    borderWidth: sizes.borderWidthStrong,
  },
  label: {
    flexShrink: 1,
  },
});
