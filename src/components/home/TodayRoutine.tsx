import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, IconBadge, LoadingState, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { ROUTINE_SLOT_ICONS, ROUTINE_SLOT_TINTS, ROUTINE_SLOTS } from '@/constants/routine';
import { tickKey } from '@/lib/routine';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { opacity, radius, sizes, spacing, useColors } from '@/theme/tokens';
import type { RoutineSlot, RoutineStep } from '@/types/routine';

/** Skeleton lines shown until the routine's first load finishes. */
const LOADING_LINES = 2;

/**
 * Today's routine on Home: a heading with how much is done, over two tiles
 * side by side, one each for the morning (sun) and the evening (dusk), each
 * with its own progress bar in the brand teal that marks what's done.
 * Tapping a tile opens the full routine on that section. Home loads the
 * routine; this only shows it.
 */
export function TodayRoutine() {
  const status = useRoutineStore((state) => state.status);
  const routine = useRoutineStore((state) => state.routine);
  const ticked = useRoutineStore((state) => state.ticked);
  const load = useRoutineStore((state) => state.load);

  // No routine yet with this account's scans: nothing to show, as before.
  if (!routine && status === 'ready') return null;

  const isTicked = (step: RoutineStep) => ticked[tickKey(step.slot, step.key)] === true;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="h3" accessibilityRole="header" style={styles.title}>
          {copy.home.routine.title}
        </Text>
        {routine ? (
          <Text variant="bodySmall" color="textSecondary">
            {copy.routine.completion(routine.steps.filter(isTicked).length, routine.steps.length)}
          </Text>
        ) : null}
      </View>

      {routine ? (
        <View style={styles.tiles}>
          {ROUTINE_SLOTS.map((slot) => {
            const steps = routine.steps.filter((step) => step.slot === slot);
            return (
              <SlotTile
                key={slot}
                slot={slot}
                done={steps.filter(isTicked).length}
                total={steps.length}
              />
            );
          })}
        </View>
      ) : (
        <Card>
          {status === 'error' ? (
            <View style={styles.notice} accessibilityLiveRegion="polite">
              <Text variant="bodySmall" color="textSecondary" style={styles.noticeText}>
                {copy.routine.loadFailed}
              </Text>
              <Button
                label={copy.common.retry}
                onPress={() => void load()}
                variant="ghost"
                size="sm"
              />
            </View>
          ) : (
            <LoadingState lines={LOADING_LINES} />
          )}
        </Card>
      )}
    </View>
  );
}

interface SlotTileProps {
  slot: RoutineSlot;
  done: number;
  total: number;
}

/** The morning or the evening: its colour, its icon, how many steps are ticked. */
function SlotTile({ slot, done, total }: SlotTileProps) {
  const palette = useColors();
  const tintName = ROUTINE_SLOT_TINTS[slot];
  const tint = palette.tints[tintName];
  const title = copy.routine[slot];
  const progress = copy.home.routine.progress(done, total);
  const fraction = total > 0 ? done / total : 0;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/routine', params: { slot } })}
      accessibilityRole="button"
      accessibilityLabel={copy.home.routine.slotLabel(title, progress)}
      accessibilityHint={copy.home.routine.openHint}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: tint.soft },
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.tileTop}>
        <IconBadge name={ROUTINE_SLOT_ICONS[slot]} size="md" tone="filled" tint={tintName} />
        <Icon name="chevronRight" size={sizes.icon.md} tint={tint.text} />
      </View>
      <View style={styles.tileText}>
        <Text variant="labelLarge">{title}</Text>
        <Text variant="bodySmall" color="textSecondary">
          {progress}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: palette.surface }]}>
        <View
          style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: palette.accent }]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tile: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileText: {
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
