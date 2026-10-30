import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { describeChange } from '@/components/scan/ResultChange';
import { Card, ChangePill, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatShortDate } from '@/lib/dates';
import type { ScanRecord } from '@/lib/progress';
import { opacity, radius, sizes, spacing, useColors } from '@/theme/tokens';

import { ScanPhoto } from './ScanPhoto';

export interface ScanHistoryProps {
  /** Oldest first. Shown newest first. */
  records: ScanRecord[];
}

function describeDelta(delta: number): string {
  if (delta > 0) return copy.progress.history.changeUp(delta);
  if (delta < 0) return copy.progress.history.changeDown(-delta);
  return copy.progress.history.changeSame;
}

/**
 * Every scan, newest first, each opening its full results. The change since
 * the scan before is a pill with an arrow and words: mint when it went up,
 * quiet otherwise, as a drop is information, not a warning.
 */
export function ScanHistory({ records }: ScanHistoryProps) {
  const palette = useColors();
  const rows = records
    .map((record, index) => ({
      record,
      delta: index > 0 ? record.result.overall - records[index - 1].result.overall : null,
    }))
    .reverse();

  return (
    <Card style={styles.card}>
      <Text variant="h3" accessibilityRole="header">
        {copy.progress.history.title}
      </Text>
      {rows.map(({ record, delta }) => {
        const { result } = record;
        const date = formatShortDate(result.createdAt);
        const change = delta === null ? copy.progress.history.baseline : describeDelta(delta);
        return (
          <Pressable
            key={result.scanId}
            onPress={() => router.push(`/progress/${result.scanId}`)}
            accessibilityRole="button"
            accessibilityLabel={copy.progress.history.row(date, result.overall, change)}
            style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
          >
            <ScanPhoto path={record.imagePath} style={styles.thumbnail} />
            <View style={styles.details}>
              <Text variant="label">{date}</Text>
              {delta === null ? (
                <Text variant="bodySmall" color="textSecondary">
                  {copy.progress.history.baseline}
                </Text>
              ) : (
                <ChangePill
                  points={delta}
                  label={describeChange(delta).text}
                  background={delta > 0 ? palette.accentSubtle : palette.background}
                  ink={delta > 0 ? palette.accentText : palette.textSecondary}
                />
              )}
            </View>
            <Text variant="h3">{result.overall}</Text>
          </Pressable>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.minTouchTarget,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  thumbnail: {
    width: sizes.thumbnail.width,
    height: sizes.thumbnail.height,
    borderRadius: radius.md,
  },
  details: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
});
