import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BackBar } from '@/components/navigation/BackBar';
import { Disclaimer, EmptyState, ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { EVENING_FROM_HOUR, MIDNIGHT_GRACE_MS } from '@/constants/routine';
import { startScan } from '@/lib/access';
import { msUntilLocalMidnight } from '@/lib/dates';
import { useBackToHome } from '@/lib/navigation';
import { tickKey } from '@/lib/routine';
import { useReminderStore } from '@/stores/useReminderStore';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { layout, spacing } from '@/theme/tokens';
import type { RoutineSlot } from '@/types/routine';

import { CompletionRing } from './CompletionRing';
import { RoutineReminderOffer } from './RoutineReminderOffer';
import { RoutineSection } from './RoutineSection';

export interface RoutineScreenProps {
  /** The section to open, when Home's morning or evening row was tapped. */
  openSlot?: RoutineSlot;
}

function currentSlot(): RoutineSlot {
  return new Date().getHours() < EVENING_FROM_HOUR ? 'morning' : 'evening';
}

/**
 * Today's routine: morning and evening steps to tick off, with the section
 * for the time of day open, or the one picked on Home. Ticks show at once and
 * save in the background, offline too. The day starts afresh at local
 * midnight. It opens from Home's routine section and from a first scan.
 */
export function RoutineScreen({ openSlot }: RoutineScreenProps) {
  const status = useRoutineStore((state) => state.status);
  const routine = useRoutineStore((state) => state.routine);
  const ticked = useRoutineStore((state) => state.ticked);
  const day = useRoutineStore((state) => state.day);
  const notice = useRoutineStore((state) => state.notice);
  const load = useRoutineStore((state) => state.load);
  const toggle = useRoutineStore((state) => state.toggle);
  const checkDay = useRoutineStore((state) => state.checkDay);
  const recordRoutineVisit = useReminderStore((state) => state.recordRoutineVisit);
  const [expanded, setExpanded] = useState<Record<RoutineSlot, boolean>>(() => {
    const slot = openSlot ?? currentSlot();
    return { morning: slot === 'morning', evening: slot === 'evening' };
  });

  useBackToHome();

  useFocusEffect(
    useCallback(() => {
      checkDay();
      void load();
      recordRoutineVisit();
    }, [checkDay, load, recordRoutineVisit]),
  );

  // Rolls over at local midnight while the screen is open.
  useEffect(() => {
    const timer = setTimeout(checkDay, msUntilLocalMidnight() + MIDNIGHT_GRACE_MS);
    return () => clearTimeout(timer);
  }, [day, checkDay]);

  if (!routine) {
    return (
      <Screen padded={false}>
        <BackBar />
        <View style={styles.centered}>
          {status === 'error' ? (
            <ErrorState message={copy.routine.loadFailed} onRetry={() => void load()} />
          ) : status === 'ready' ? (
            <EmptyState
              title={copy.routine.empty.title}
              body={copy.routine.empty.body}
              action={{
                label: copy.routine.empty.cta,
                onPress: startScan,
              }}
            />
          ) : (
            <LoadingState lines={4} />
          )}
        </View>
      </Screen>
    );
  }

  const morning = routine.steps.filter((step) => step.slot === 'morning');
  const evening = routine.steps.filter((step) => step.slot === 'evening');
  const done = routine.steps.filter((step) => ticked[tickKey(step.slot, step.key)]).length;

  const toggleSection = (slot: RoutineSlot) =>
    setExpanded((current) => ({ ...current, [slot]: !current[slot] }));

  return (
    <Screen padded={false}>
      <BackBar />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text variant="h1" accessibilityRole="header">
              {copy.routine.title}
            </Text>
            <Text color="textSecondary">{copy.routine.completion(done, routine.steps.length)}</Text>
          </View>
          <CompletionRing done={done} total={routine.steps.length} />
        </View>

        {notice ? (
          <Text
            variant="bodySmall"
            color="textSecondary"
            align="center"
            accessibilityLiveRegion="polite"
          >
            {notice === 'offline' ? copy.routine.saveFailed : copy.routine.tickFailed}
          </Text>
        ) : null}

        <RoutineReminderOffer />

        <RoutineSection
          slot="morning"
          steps={morning}
          ticked={ticked}
          expanded={expanded.morning}
          onToggleExpanded={() => toggleSection('morning')}
          onToggleStep={toggle}
        />
        <RoutineSection
          slot="evening"
          steps={evening}
          ticked={ticked}
          expanded={expanded.evening}
          onToggleExpanded={() => toggleSection('evening')}
          onToggleStep={toggle}
        />

        <Text variant="bodySmall" color="textSecondary" align="center">
          {copy.routine.consistency}
        </Text>

        <Disclaimer />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: layout.gutter,
  },
  content: {
    gap: spacing.lg,
    padding: layout.gutter,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
});
