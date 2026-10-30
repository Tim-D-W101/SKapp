import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChangeChip, changeChipText } from '@/components/scan/ChangeChip';
import { Card, Icon, ScoreRing, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatShortDate } from '@/lib/dates';
import { opacity, sizes, spacing } from '@/theme/tokens';
import type { ScanResult } from '@/types/scan';

export interface LatestScanCardProps {
  latest: ScanResult;
  /** The scan before it, for the change since then. Null on a first scan. */
  previous: ScanResult | null;
}

/**
 * The latest overall score on Home, answering the question the app is for:
 * is it moving? The teal ring sits on the latest scan's apricot track, with
 * the date and the change since the scan before (or that this is the
 * baseline) beside it. Peach stays an accent here, on a plain card, so the
 * scan card above remains the one block of colour. Tapping anywhere opens
 * that scan's results.
 */
export function LatestScanCard({ latest, previous }: LatestScanCardProps) {
  const date = formatShortDate(latest.createdAt);
  const delta = previous ? latest.overall - previous.overall : null;

  return (
    <Pressable
      onPress={() => router.push(`/progress/${latest.scanId}`)}
      accessibilityRole="button"
      accessibilityLabel={copy.home.latest.label(latest.overall, date, changeChipText(delta))}
      accessibilityHint={copy.home.latest.hint}
      style={({ pressed }) => (pressed ? styles.pressed : null)}
    >
      <Card style={styles.card}>
        <ScoreRing score={latest.overall} label={copy.results.overall} trackTint="peach" />
        <View style={styles.text}>
          <Text variant="h3">{date}</Text>
          <ChangeChip delta={delta} />
          <View style={styles.action}>
            <Text variant="label" color="accentText" style={styles.actionLabel}>
              {copy.home.seeResults}
            </Text>
            <Icon name="chevronRight" size={sizes.icon.md} color="accentText" />
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
    gap: spacing.lg,
  },
  text: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionLabel: {
    flexShrink: 1,
  },
});
