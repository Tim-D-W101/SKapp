import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';

import { Text } from './Text';

export interface SectionHeaderProps {
  title: string;
  /** A short note at the other end, such as a count. */
  detail?: string;
}

/**
 * A section's name above its card or tiles, quieter than a card's own title:
 * it says what follows without competing with it.
 */
export function SectionHeader({ title, detail }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text variant="label" color="textSecondary" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {detail ? (
        <Text variant="bodySmall" color="textSecondary">
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  title: {
    flex: 1,
  },
});
