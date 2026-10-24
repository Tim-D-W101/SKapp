import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Icon, ScoreRing, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatShortDate } from '@/lib/dates';
import { opacity, sizes, spacing, useColors } from '@/theme/tokens';
import type { ScanResult } from '@/types/scan';

export interface LatestScanCardProps {
  latest: ScanResult;
}

/**
 * The latest overall score on Home, on a warm peach card beside the teal
 * ring: the ring on one side, when it was taken and the way to its results
 * on the other. Kept to one row, so the morning and evening routine show on
 * the first screen too. Tapping anywhere opens that scan's results.
 */
export function LatestScanCard({ latest }: LatestScanCardProps) {
  const palette = useColors();
  const date = copy.home.latestDate(formatShortDate(latest.createdAt));

  return (
    <Pressable
      onPress={() => router.push(`/progress/${latest.scanId}`)}
      accessibilityRole="button"
      accessibilityLabel={copy.home.latest.label(latest.overall, date)}
      accessibilityHint={copy.home.latest.hint}
      style={({ pressed }) => (pressed ? styles.pressed : null)}
    >
      <Card tint="peach" style={styles.card}>
        <ScoreRing score={latest.overall} label={copy.results.overall} trackColor="background" />
        <View style={styles.text}>
          <Text variant="label" tint="peach">
            {copy.home.latest.title}
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            {date}
          </Text>
          <View style={styles.action}>
            <Text variant="label" tint="peach" style={styles.actionLabel}>
              {copy.home.seeResults}
            </Text>
            <Icon name="chevronRight" size={sizes.icon.md} tint={palette.tints.peach.text} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: opacity.pressed,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  actionLabel: {
    flexShrink: 1,
  },
});
