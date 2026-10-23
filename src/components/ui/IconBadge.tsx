import { StyleSheet, View } from 'react-native';

import { radius, sizes, useColors, type ColorName } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';

export type IconBadgeTone = 'filled' | 'soft' | 'neutral';

export interface IconBadgeProps {
  name: IconName;
  /** `sm` beside a line of text; `lg` above a screen's title. */
  size?: 'sm' | 'lg';
  /**
   * `filled` is a coral disc with a white icon, `soft` a peach disc with a
   * coral icon, and `neutral` a quiet one for calm, recoverable moments.
   */
  tone?: IconBadgeTone;
}

const TONES: Record<IconBadgeTone, { background: ColorName; icon: ColorName }> = {
  filled: { background: 'accent', icon: 'textInverse' },
  soft: { background: 'accentSubtle', icon: 'accentText' },
  neutral: { background: 'surface', icon: 'textSecondary' },
};

/** An icon on a round badge. Decorative, like the icon itself: the text beside it carries the meaning. */
export function IconBadge({ name, size = 'sm', tone = 'soft' }: IconBadgeProps) {
  const palette = useColors();
  const diameter = sizes.iconBadge[size];
  const colors = TONES[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          width: diameter,
          height: diameter,
          backgroundColor: palette[colors.background],
          borderColor: tone === 'neutral' ? palette.border : 'transparent',
        },
      ]}
    >
      <Icon name={name} size={size === 'lg' ? sizes.icon.xl : sizes.icon.sm} color={colors.icon} />
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
