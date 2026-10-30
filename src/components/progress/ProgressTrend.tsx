import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Card, Chip, SectionTitle, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import type { ProgressMetric } from '@/constants/progress';
import { ATTRIBUTE_KEYS } from '@/constants/scan';
import { formatShortDate } from '@/lib/dates';
import type { ScanRecord } from '@/lib/progress';
import { layout, spacing } from '@/theme/tokens';
import type { ScanResult } from '@/types/scan';

import { TrendChart } from './TrendChart';

const METRICS: readonly { metric: ProgressMetric; label: string }[] = [
  { metric: 'overall', label: copy.progress.chart.filterOverall },
  ...ATTRIBUTE_KEYS.map((key) => ({ metric: key, label: copy.results.attributes[key] })),
];

function valueOf(result: ScanResult, metric: ProgressMetric): number {
  return metric === 'overall' ? result.overall : result.scores[metric];
}

export interface ProgressTrendProps {
  /** Oldest first. */
  records: ScanRecord[];
}

/**
 * The trend over time, switchable between the overall score and each
 * attribute, with the selected scan's details below. With one scan there is
 * no line yet, and it says so.
 */
export function ProgressTrend({ records }: ProgressTrendProps) {
  const [metric, setMetric] = useState<ProgressMetric>('overall');
  // Follows a scan, not a position, so a new scan arriving doesn't shift the selection.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (records.length < 2) {
    return (
      <Card style={styles.card}>
        <SectionTitle title={copy.progress.chart.title} icon="chart" tint="mint" />
        <Text color="textSecondary">{copy.progress.chart.needTwo}</Text>
      </Card>
    );
  }

  const found = records.findIndex((record) => record.result.scanId === selectedId);
  const selectedIndex = found >= 0 ? found : records.length - 1;
  const selected = records[selectedIndex].result;
  const metricLabel = METRICS.find((item) => item.metric === metric)?.label ?? '';
  const selectedDate = formatShortDate(selected.createdAt);
  const selectedValue = valueOf(selected, metric);

  return (
    <Card style={styles.card}>
      <SectionTitle title={copy.progress.chart.title} icon="chart" tint="mint" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroller}
        contentContainerStyle={styles.chips}
        accessibilityRole="radiogroup"
        accessibilityLabel={copy.progress.chart.filterLabel}
      >
        {METRICS.map((item) => (
          <Chip
            key={item.metric}
            label={item.label}
            selected={item.metric === metric}
            onPress={() => setMetric(item.metric)}
            role="radio"
          />
        ))}
      </ScrollView>

      <View style={styles.readout}>
        <View style={styles.readoutText}>
          <Text variant="h2">{selectedValue}</Text>
          <Text variant="bodySmall" color="textSecondary">
            {selectedDate}
          </Text>
        </View>
        <Button
          label={copy.progress.chart.viewScan}
          variant="ghost"
          size="sm"
          onPress={() => router.push(`/progress/${selected.scanId}`)}
        />
      </View>

      <TrendChart
        points={records.map((record) => ({
          time: new Date(record.result.createdAt).getTime(),
          value: valueOf(record.result, metric),
        }))}
        tint="mint"
        selectedIndex={selectedIndex}
        onSelect={(index) => setSelectedId(records[index].result.scanId)}
        firstLabel={formatShortDate(records[0].result.createdAt)}
        lastLabel={formatShortDate(records[records.length - 1].result.createdAt)}
        accessibilityLabel={copy.progress.chart.label(metricLabel, records.length)}
        selectedDescription={copy.progress.chart.point(selectedDate, selectedValue)}
        accessibilityHint={copy.progress.chart.hint}
      />

      <View style={styles.notes}>
        <Text variant="caption" color="textSecondary">
          {copy.progress.chart.noiseBand}
        </Text>
        <Text variant="caption" color="textSecondary">
          {copy.progress.chart.range}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  /** Runs to the card's edges, so the chips scroll out of sight there rather than at its padding. */
  chipScroller: {
    marginHorizontal: -layout.cardPadding,
  },
  chips: {
    gap: spacing.sm,
    paddingHorizontal: layout.cardPadding,
  },
  readout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readoutText: {
    gap: spacing.xs,
  },
  notes: {
    gap: spacing.xs,
  },
});
