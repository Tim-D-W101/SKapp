import { StyleSheet } from 'react-native';

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
 * The latest overall score and the journey since the first scan. With one
 * scan, an encouraging note that the second is where change shows up.
 */
export function ProgressHero({ records }: ProgressHeroProps) {
  const first = records[0].result;
  const latest = records[records.length - 1].result;

  if (records.length === 1) {
    const next = nextScanDate(latest.createdAt);
    return (
      <Card style={styles.card}>
        <ScoreRing score={latest.overall} label={copy.progress.latest} />
        <Text variant="h3" align="center" accessibilityRole="header">
          {copy.progress.oneScan.title}
        </Text>
        <Text color="textSecondary" align="center">
          {copy.progress.oneScan.body}
        </Text>
        <Text variant="label" align="center">
          {next ? copy.progress.oneScan.nextScan(next) : copy.progress.oneScan.nextScanNow}
        </Text>
        {next ? null : <Button label={copy.progress.oneScan.cta} onPress={startScan} fullWidth />}
      </Card>
    );
  }

  const days = calendarDaysBetween(first.createdAt, latest.createdAt);
  return (
    <Card style={styles.card}>
      <ScoreRing score={latest.overall} label={copy.progress.latest} />
      <Text variant="h3" align="center">
        {copy.progress.journey(latest.overall - first.overall, copy.progress.journeySpan(days))}
      </Text>
      <Text variant="bodySmall" color="textSecondary" align="center">
        {copy.progress.sinceFirst}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.sm,
  },
});
