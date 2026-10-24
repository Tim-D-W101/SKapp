import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, IconBadge, LoadingState, SectionTitle, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { ROUTINE_SLOT_ICONS, ROUTINE_SLOT_TINTS, ROUTINE_SLOTS } from '@/constants/routine';
import { tickKey } from '@/lib/routine';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { opacity, radius, sizes, spacing, useColors } from '@/theme/tokens';
import type { RoutineStep } from '@/types/routine';

/** Skeleton lines shown until the routine's first load finishes. */
const LOADING_LINES = 2;

/**
 * Today's routine on Home: how much of it is done, and a row each for the
 * morning and evening steps. Tapping a row opens the full routine on that
 * section. Home loads the routine; this only shows it.
 */
export function TodayRoutine() {
  const palette = useColors();
  const status = useRoutineStore((state) => state.status);
  const routine = useRoutineStore((state) => state.routine);
  const ticked = useRoutineStore((state) => state.ticked);
  const load = useRoutineStore((state) => state.load);

  // No routine yet with this account's scans: nothing to show, as before.
  if (!routine && status === 'ready') return null;

  const isTicked = (step: RoutineStep) => ticked[tickKey(step.slot, step.key)] === true;

  return (
    <Card style={styles.card}>
      <SectionTitle title={copy.home.routine.title} icon="check" tint="mint" />
      {routine ? (
        <Text color="textSecondary">
          {copy.routine.completion(routine.steps.filter(isTicked).length, routine.steps.length)}
        </Text>
      ) : null}

      {routine ? (
        ROUTINE_SLOTS.map((slot) => {
          const steps = routine.steps.filter((step) => step.slot === slot);
          const done = steps.filter(isTicked).length;
          const title = copy.routine[slot];
          const progress = copy.home.routine.progress(done, steps.length);
          const fraction = steps.length > 0 ? done / steps.length : 0;
          const tint = palette.tints[ROUTINE_SLOT_TINTS[slot]];

          return (
            <Pressable
              key={slot}
              onPress={() => router.push({ pathname: '/routine', params: { slot } })}
              accessibilityRole="button"
              accessibilityLabel={copy.home.routine.slotLabel(title, progress)}
              accessibilityHint={copy.home.routine.openHint}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: tint.soft, borderColor: tint.soft },
                pressed ? styles.pressed : null,
              ]}
            >
              <IconBadge
                name={ROUTINE_SLOT_ICONS[slot]}
                size="md"
                tone="filled"
                tint={ROUTINE_SLOT_TINTS[slot]}
              />
              <View style={styles.rowText}>
                <Text variant="label">{title}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {progress}
                </Text>
                <View style={[styles.track, { backgroundColor: palette.surface }]}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${fraction * 100}%`, backgroundColor: tint.text },
                    ]}
                  />
                </View>
              </View>
              <Icon name="chevronRight" size={sizes.icon.md} tint={tint.text} />
            </Pressable>
          );
        })
      ) : status === 'error' ? (
        <View style={styles.notice} accessibilityLiveRegion="polite">
          <Text variant="bodySmall" color="textSecondary" style={styles.noticeText}>
            {copy.routine.loadFailed}
          </Text>
          <Button label={copy.common.retry} onPress={() => void load()} variant="ghost" size="sm" />
        </View>
      ) : (
        <LoadingState lines={LOADING_LINES} />
      )}
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
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  track: {
    height: sizes.routineProgress,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
  },
});
