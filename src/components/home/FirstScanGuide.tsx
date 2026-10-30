import { StyleSheet, View } from 'react-native';

import { Card, SectionHeader, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { radius, sizes, spacing, useColors, type TintName } from '@/theme/tokens';

/**
 * Each step's number, in the colour of what it leads to: the brand's scan,
 * the sunny routine, and coral for coming back each week.
 */
const STEP_TINTS = ['mint', 'sun', 'coral'] as const satisfies readonly TintName[];

/**
 * Home before the first scan: under the scan card, the three steps that
 * follow it, so the first screen explains the app instead of leaving a gap.
 * The scan card above is the way to start.
 */
export function FirstScanGuide() {
  const palette = useColors();

  return (
    <View style={styles.section}>
      <SectionHeader title={copy.home.howItWorks.title} />
      <Card style={styles.card}>
        {copy.home.howItWorks.steps.map((step, index) => {
          const tint = palette.tints[STEP_TINTS[index % STEP_TINTS.length]];
          return (
            <View key={step.title} style={styles.step}>
              <View
                style={[styles.number, { backgroundColor: tint.fill }]}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Text variant="label" style={{ color: tint.onFill }}>
                  {index + 1}
                </Text>
              </View>
              <View style={styles.stepText}>
                <Text variant="label">{step.title}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {step.body}
                </Text>
              </View>
            </View>
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  number: {
    width: sizes.iconBadge.md,
    height: sizes.iconBadge.md,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
    gap: spacing.xs,
  },
});
