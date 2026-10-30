import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { radius, sizes, spacing, useColors } from '@/theme/tokens';

import { describeChange } from './ResultChange';

export interface ChangeChipProps {
  /** The overall score minus the one before it. Null on a first scan, which has nothing before it. */
  delta: number | null;
}

/** The chip's message in words: "Up 5 since last scan", or that this scan is the baseline. */
export function changeChipText(delta: number | null): string {
  return delta === null
    ? copy.results.baseline
    : copy.results.sinceLastFull(describeChange(delta).text);
}

/**
 * The change since the scan before: a small chip in the latest scan's
 * apricot ("Up 5", ink beside a direction arrow, so it reads the same
 * whichever way the score moved and never relies on colour), then "since
 * last scan". On a first scan the chip says it's the baseline. Read out as
 * one phrase.
 */
export function ChangeChip({ delta }: ChangeChipProps) {
  const palette = useColors();
  const change = delta === null ? null : describeChange(delta);

  return (
    <View style={styles.row} accessible accessibilityLabel={changeChipText(delta)}>
      <View style={[styles.chip, { backgroundColor: palette.tints.peach.soft }]}>
        {change ? <Icon name={change.icon} size={sizes.icon.sm} color={change.color} /> : null}
        <Text variant="label">{change ? change.text : copy.results.baseline}</Text>
      </View>
      {change ? (
        <Text variant="bodySmall" color="textSecondary">
          {copy.results.sinceLast}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.sm,
    rowGap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: sizes.iconBadge.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
});
