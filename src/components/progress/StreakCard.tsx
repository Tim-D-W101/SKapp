import { StyleSheet, View } from 'react-native';

import { Card, SunMark, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { weeklyStreak } from '@/lib/streak';
import { sizes, spacing } from '@/theme/tokens';

export interface StreakCardProps {
  /** When each scan was taken. */
  scanDates: string[];
}

/**
 * Consecutive weeks with a scan. Warm either way: a lapsed streak is an
 * invitation to start a new one, never a reproach.
 */
export function StreakCard({ scanDates }: StreakCardProps) {
  const weeks = weeklyStreak(scanDates);

  return (
    <Card style={styles.card} tint="sun">
      <View style={styles.header}>
        <SunMark width={sizes.sunMark.sm} />
        <Text variant="h3" accessibilityRole="header">
          {copy.progress.streak.title}
        </Text>
      </View>
      {weeks > 0 ? (
        <>
          <Text variant="h2">{copy.progress.streak.weeks(weeks)}</Text>
          <Text variant="bodySmall" color="textSecondary">
            {copy.progress.streak.keepGoing}
          </Text>
        </>
      ) : (
        <Text color="textSecondary">{copy.progress.streak.restart}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
