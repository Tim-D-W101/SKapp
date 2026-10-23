import { StyleSheet, View } from 'react-native';

import { radius, sizes, useColors, type ColorName, type TintName } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';

export type IconBadgeTone = 'filled' | 'soft' | 'neutral';

export interface IconBadgeProps {
  name: IconName;
  /** `sm` beside a line of text, `md` beside a card's title, `lg` above a screen's title. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * `filled` is a teal disc with a white icon, `soft` a mint disc with a
   * teal icon, and `neutral` a quiet one for calm, recoverable moments.
   */
  tone?: IconBadgeTone;
  /**
   * Draws a `filled` or `soft` badge in one of the supporting colours
   * instead of the brand teal: the bright colour with a deep icon, or the
   * soft one with the tint's text colour. Ignored for `neutral`.
   */
  tint?: TintName;
}

const TONES: Record<IconBadgeTone, { background: ColorName; icon: ColorName }> = {
  filled: { background: 'accent', icon: 'textInverse' },
  soft: { background: 'accentSubtle', icon: 'accentText' },
  neutral: { background: 'surface', icon: 'textSecondary' },
};

const ICON_SIZES = {
  sm: sizes.icon.sm,
  md: sizes.icon.md,
  lg: sizes.icon.xl,
} as const satisfies Record<NonNullable<IconBadgeProps['size']>, number>;

/** An icon on a round badge. Decorative, like the icon itself: the text beside it carries the meaning. */
export function IconBadge({ name, size = 'sm', tone = 'soft', tint }: IconBadgeProps) {
  const palette = useColors();
  const diameter = sizes.iconBadge[size];
  const colors = TONES[tone];
  const tinted = tint && tone !== 'neutral' ? palette.tints[tint] : null;
  let background = palette[colors.background];
  let ink = palette[colors.icon];
  if (tinted) {
    background = tone === 'filled' ? tinted.fill : tinted.soft;
    ink = tone === 'filled' ? tinted.onFill : tinted.text;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          width: diameter,
          height: diameter,
          backgroundColor: background,
          borderColor: tone === 'neutral' ? palette.border : 'transparent',
        },
      ]}
    >
      <Icon name={name} size={ICON_SIZES[size]} tint={ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: sizes.borderWidth,
  },
});
