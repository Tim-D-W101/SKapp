import { StyleSheet, View } from 'react-native';

import { radius, sizes, spacing } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface ChangePillProps {
  /** Points since the scan before: up, down or the same. Sets the arrow. */
  points: number;
  /** What it says in words, such as "Up 4 since last scan", so it never relies on the arrow or colour. */
  label: string;
  /** Its fill and its ink, from the palette. The ink must meet 4.5:1 on the fill. */
  background: string;
  ink: string;
}

/** The arrow for a change: up, down, or level. */
function arrowFor(points: number): IconName {
  if (points > 0) return 'arrowUp';
  if (points < 0) return 'arrowDown';
  return 'minus';
}

/** How a score moved, on a small pill: an arrow and the change in words. */
export function ChangePill({ points, label, background, ink }: ChangePillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      <Icon name={arrowFor(points)} size={sizes.icon.sm} tint={ink} />
      <Text variant="label" style={[styles.label, { color: ink }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: sizes.chip,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  label: {
    flexShrink: 1,
  },
});
