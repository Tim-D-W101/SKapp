import { StyleSheet, View } from 'react-native';

import { Button, Card, ScoreRing, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { startScan } from '@/lib/access';
import { calendarDaysBetween } from '@/lib/dates';
import { nextScanDate, type ScanRecord } from '@/lib/progress';
import { spacing } from '@/theme/tokens';

export interface ProgressHeroProps {
  /** Oldest first, at least one. */
  records: ScanRecord[];
}

/**
 * The latest overall score beside the journey since the first scan, on the
 * latest scan's peach. Kept to one row, so the trend below shows on the
 * first screen too; the change since the scan before is on Home's hero and
 * in the history. With one scan, an encouraging note that the second is
 * where change shows up.
 */
export function ProgressHero({ records }: ProgressHeroProps) {
  const first = records[0].result;
  const latest = records[records.length - 1].result;
  const ring = (
    <ScoreRing score={latest.overall} label={copy.progress.latest} trackColor="surface" />
  );

  if (records.length === 1) {
    const next = nextScanDate(latest.createdAt);
    return (
      <Card style={styles.card} tint="peach">
        <View style={styles.row}>
          {ring}
          <View style={styles.text}>
            <Text variant="h3" accessibilityRole="header">
              {copy.progress.oneScan.title}
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              {copy.progress.oneScan.body}
            </Text>
          </View>
        </View>
        <Text variant="label">
          {next ? copy.progress.oneScan.nextScan(next) : copy.progress.oneScan.nextScanNow}
        </Text>
        {next ? null : <Button label={copy.progress.oneScan.cta} onPress={startScan} fullWidth />}
      </Card>
    );
  }

  const days = calendarDaysBetween(first.createdAt, latest.createdAt);
  return (
    <Card style={styles.card} tint="peach">
      <View style={styles.row}>
        {ring}
        <View style={styles.text}>
          <Text variant="h2">
            {copy.progress.journey(latest.overall - first.overall, copy.progress.journeySpan(days))}
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            {copy.progress.sinceFirst}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
});
