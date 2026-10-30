import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Disclaimer,
  ErrorState,
  LoadingState,
  Screen,
  SectionHeader,
  Text,
} from '@/components/ui';
import { copy } from '@/constants/copy';
import { nextScanDate } from '@/lib/progress';
import { useProgressStore } from '@/stores/useProgressStore';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { spacing } from '@/theme/tokens';

import { FirstScanGuide } from './FirstScanGuide';
import { HomeHeader } from './HomeHeader';
import { LatestScanCard } from './LatestScanCard';
import { RemindersCard } from './RemindersCard';
import { ScanCard } from './ScanCard';
import { TodayRoutine } from './TodayRoutine';

/** Skeleton lines shown until the first load finishes. */
const LOADING_LINES = 4;

/**
 * Today, in the order it's needed: a greeting and the date, the big "Scan my
 * skin" card (which also says when the next weekly scan is due), the latest
 * score with its change since the scan before, today's routine as a morning
 * and an evening tile, and the next reminder. Each leads to the screen with
 * the detail, and the profile button in the header opens Settings. The
 * header and the scan card show in every state, so scanning and Settings are
 * always one tap away; before the first scan, the steps that follow it fill
 * the rest. It reads the same stores as the Progress tab and the routine and
 * refreshes them on each visit, so all three always agree.
 *
 * One block of colour leads (the brand teal scan card); everything under it
 * is a plain card or tile under a quiet section header, with colour by
 * meaning (see TintName): the apricot ring track and change chip of the
 * latest scan, the sun and dusk tiles of the routine, the coral bell of the
 * reminders.
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

  if (records.length === 0) {
    return (
      <Screen scroll edges={['top', 'right', 'left']} contentStyle={[styles.content, styles.grow]}>
        <HomeHeader />
        <ScanCard />
        {status === 'error' ? (
          <View style={styles.centered}>
            <ErrorState message={copy.home.loadFailed} onRetry={retry} />
          </View>
        ) : status === 'ready' ? (
          <FirstScanGuide />
        ) : (
          <LoadingState lines={LOADING_LINES} />
        )}
      </Screen>
    );
  }

  const latest = records[records.length - 1].result;
  const previous = records.length > 1 ? records[records.length - 2].result : null;
  const next = nextScanDate(latest.createdAt);

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

      <ScanCard note={next ? copy.home.scan.next(next) : copy.home.scan.due} />

      <View style={styles.section}>
        <SectionHeader title={copy.home.latest.title} />
        <LatestScanCard latest={latest} previous={previous} />
      </View>

      <TodayRoutine />

      <RemindersCard />

      <Disclaimer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    gap: spacing.lg,
  },
  grow: {
    flexGrow: 1,
  },
  section: {
    gap: spacing.sm,
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
