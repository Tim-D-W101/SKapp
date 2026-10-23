import { StyleSheet, View } from 'react-native';

import { SunMark, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { layout, radius, sizes, spacing, useColors } from '@/theme/tokens';
import type { AttributeKey } from '@/types/scan';

export interface ResultFocusProps {
  focusAreas: AttributeKey[];
  scores: Record<AttributeKey, number>;
}

/**
 * The one to three attributes to prioritise, set apart from the other scores
 * on a warm sun-yellow panel, and framed as room to improve, never as a
 * shortfall.
 */
export function ResultFocus({ focusAreas, scores }: ResultFocusProps) {
  const palette = useColors();
  const tint = palette.tints.sun;

  return (
    <View style={[styles.container, { backgroundColor: tint.soft }]}>
      <View style={styles.header}>
        <SunMark width={sizes.sunMark.sm} />
        <Text variant="h3" accessibilityRole="header">
          {copy.results.focusTitle}
        </Text>
      </View>
      <View style={styles.areas}>
        {focusAreas.map((key) => (
          <View
            key={key}
            style={[
              styles.area,
              { backgroundColor: palette.surfaceElevated, borderColor: tint.text },
            ]}
            accessible
            accessibilityLabel={`${copy.results.attributes[key]}, ${scores[key]}`}
          >
            <Text variant="label">{copy.results.attributes[key]}</Text>
            <Text variant="label" tint="sun">
              {scores[key]}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="bodySmall" color="textSecondary">
        {copy.results.lowScoreNote}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    padding: layout.cardPadding,
    borderRadius: radius.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  areas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  area: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.chip,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: sizes.borderWidthStrong,
  },
});
