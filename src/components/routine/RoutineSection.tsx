import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Icon, IconBadge, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { ROUTINE_SLOT_ICONS, ROUTINE_SLOT_TINTS } from '@/constants/routine';
import { hapticImpact } from '@/lib/haptics';
import { tickKey } from '@/lib/routine';
import { illustrationForStep } from '@/lib/routineIllustration';
import { opacity, radius, sizes, spacing, useColors } from '@/theme/tokens';
import type { RoutineSlot, RoutineStep } from '@/types/routine';

import { ProductIllustration } from './ProductIllustration';

export interface RoutineSectionProps {
  slot: RoutineSlot;
  steps: RoutineStep[];
  ticked: Record<string, true>;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleStep: (step: RoutineStep) => void;
}

/**
 * Morning or evening: a header that opens and closes the section, and its
 * steps to tick off. Each section is in its own colour (sun or dusk),
 * and so are its ticks; each step's drawing is in the colour of its kind.
 */
export function RoutineSection({
  slot,
  steps,
  ticked,
  expanded,
  onToggleExpanded,
  onToggleStep,
}: RoutineSectionProps) {
  const palette = useColors();
  const title = slot === 'morning' ? copy.routine.morning : copy.routine.evening;
  const done = steps.filter((step) => ticked[tickKey(step.slot, step.key)]).length;
  const count = copy.routine.sectionCount(done, steps.length);
  const tintName = ROUTINE_SLOT_TINTS[slot];
  const tint = palette.tints[tintName];

  return (
    <Card style={styles.card} tint={tintName}>
      <Pressable
        onPress={onToggleExpanded}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${count}`}
        accessibilityState={{ expanded }}
        style={({ pressed }) => [styles.header, pressed ? styles.pressed : null]}
      >
        <IconBadge name={ROUTINE_SLOT_ICONS[slot]} size="md" tone="filled" tint={tintName} />
        <Text variant="h3" accessibilityRole="header" style={styles.headerTitle}>
          {title}
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          {count}
        </Text>
        <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={sizes.icon.md} tint={tint.text} />
      </Pressable>

      {expanded
        ? steps.map((step) => {
            const isDone = ticked[tickKey(step.slot, step.key)] === true;
            return (
              <Pressable
                key={step.key}
                onPress={() => {
                  if (!isDone) hapticImpact();
                  onToggleStep(step);
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isDone }}
                accessibilityLabel={step.title}
                accessibilityHint={step.why}
                style={({ pressed }) => [styles.step, pressed ? styles.pressed : null]}
              >
                <View
                  style={[
                    styles.box,
                    isDone
                      ? { backgroundColor: tint.text, borderColor: tint.text }
                      : {
                          backgroundColor: palette.surfaceElevated,
                          borderColor: palette.borderStrong,
                        },
                  ]}
                >
                  {isDone ? (
                    <Icon name="check" size={sizes.icon.sm} tint={palette.textInverse} />
                  ) : null}
                </View>
                {/* The title already names the product, so the drawing stays quiet. */}
                <ProductIllustration kind={illustrationForStep(step)} decorative />
                <View style={styles.stepText}>
                  <Text variant="label" color={isDone ? 'textSecondary' : 'textPrimary'}>
                    {step.title}
                  </Text>
                  <Text variant="bodySmall" color="textSecondary">
                    {step.why}
                  </Text>
                </View>
              </Pressable>
            );
          })
        : null}
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
    minHeight: sizes.minTouchTarget,
  },
  headerTitle: {
    flex: 1,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.minTouchTarget,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  box: {
    width: sizes.checkbox,
    height: sizes.checkbox,
    borderRadius: radius.sm,
    borderWidth: sizes.checkboxBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
    gap: spacing.xs,
  },
});
