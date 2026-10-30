import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Disclaimer, ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { useProgressStore } from '@/stores/useProgressStore';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { spacing } from '@/theme/tokens';

import { HomeHeader } from './HomeHeader';
import { HomeHero } from './HomeHero';
import { RemindersCard } from './RemindersCard';
import { TodayRoutine } from './TodayRoutine';

/** Skeleton lines shown under the hero until the first load finishes. */
const LOADING_LINES = 4;

/**
 * Where things stand today, all on the first screen: the date and a
 * greeting, then the teal hero with the latest score, how it moved and
 * "Scan my skin", then today's morning and evening routine, then the next
 * reminder. Each part leads to the screen with the detail, and the profile
 * button in the header opens Settings. The header and the hero show in
 * every state, so scanning and Settings are always one tap away. It reads
 * the same stores as the Progress tab and the routine and refreshes them on
 * each visit, so all three always agree.
 *
 * Colour is by meaning, and placed (see TintName): the brand teal hero with
 * a peach pill for the change in score, the routine's sun and dusk tiles,
 * and the reminders' coral bell and pill. Everything else is plain.
 */
export function HomeScreen() {
  const status = useProgressStore((state) => state.status);
  const records = useProgressStore((state) => state.records);
  const refreshFailed = useProgressStore((state) => state.refreshFailed);
  const loadProgress = useProgressStore((state) => state.load);
  const loadRoutine = useRoutineStore((state) => state.load);
  const checkDay = useRoutineStore((state) => state.checkDay);

  useFocusEffect(
    useCallback(() => {
      void loadProgress();
      checkDay();
      void loadRoutine();
    }, [loadProgress, checkDay, loadRoutine]),
  );

  const retry = () => void loadProgress();
  const hasScans = records.length > 0;

  return (
    <Screen scroll edges={['top', 'right', 'left']} contentStyle={styles.content}>
      <HomeHeader />

      {refreshFailed ? (
        <View style={styles.notice} accessibilityLiveRegion="polite">
          <Text variant="bodySmall" color="textSecondary" style={styles.noticeText}>
            {copy.home.loadFailed}
          </Text>
          <Button label={copy.common.retry} onPress={retry} variant="ghost" size="sm" />
        </View>
      ) : null}

      <HomeHero records={records} loaded={status === 'ready'} />

      {hasScans ? (
        <>
          <TodayRoutine />
          <RemindersCard />
          <Disclaimer />
        </>
      ) : status === 'error' ? (
        <ErrorState message={copy.home.loadFailed} onRetry={retry} />
      ) : status === 'ready' ? null : (
        <LoadingState lines={LOADING_LINES} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
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
