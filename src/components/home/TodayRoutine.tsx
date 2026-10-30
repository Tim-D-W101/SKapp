import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, IconBadge, LoadingState, SectionHeader, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { ROUTINE_SLOT_ICONS, ROUTINE_SLOT_TINTS, ROUTINE_SLOTS } from '@/constants/routine';
import { tickKey } from '@/lib/routine';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { opacity, radius, sizes, spacing, useColors } from '@/theme/tokens';
import type { RoutineSlot, RoutineStep } from '@/types/routine';

/** Skeleton lines shown until the routine's first load finishes. */
const LOADING_LINES = 2;

/**
 * Today's routine on Home: how much of it is done, then the morning and the
 * evening side by side, each a tile in its own colour (sun and dusk) with its
 * progress. Progress is always the brand's teal, so a warm tile never grows a
 * brown bar. Tapping a tile opens the full routine on that section. Home
 * loads the routine; this only shows it.
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
      <SectionHeader
        title={copy.home.routine.title}
        detail={
          routine
            ? copy.routine.completion(routine.steps.filter(isTicked).length, routine.steps.length)
            : undefined
        }
      />

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
      ) : status === 'error' ? (
        <Card>
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
        </Card>
      ) : (
        <Card>
          <LoadingState lines={LOADING_LINES} />
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

/** The morning or the evening: its icon, name, steps done and a bar, on its own colour. */
function SlotTile({ slot, done, total }: SlotTileProps) {
  const palette = useColors();
  const tintName = ROUTINE_SLOT_TINTS[slot];
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
        { backgroundColor: palette.tints[tintName].soft },
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.tileTop}>
        <IconBadge name={ROUTINE_SLOT_ICONS[slot]} size="md" tone="filled" tint={tintName} />
        <Icon name="chevronRight" size={sizes.icon.md} color="textSecondary" />
      </View>
      <View style={styles.tileText}>
        <Text variant="h3">{title}</Text>
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
    gap: spacing.sm,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
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
