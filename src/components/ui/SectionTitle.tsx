import { StyleSheet, View } from 'react-native';

import { spacing, type TintName } from '@/theme/tokens';

import type { IconName } from './Icon';
import { IconBadge } from './IconBadge';
import { Text } from './Text';

export interface SectionTitleProps {
  title: string;
  /** Shown on a badge in the section's colour, before the title. */
  icon: IconName;
  /** The section's colour (see TintName). */
  tint: TintName;
}

/** A card's or a section's title, with an icon badge in its colour beside it. */
export function SectionTitle({ title, icon, tint }: SectionTitleProps) {
  return (
    <View style={styles.row}>
      <IconBadge name={icon} size="md" tone="filled" tint={tint} />
      <Text variant="h3" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
});
