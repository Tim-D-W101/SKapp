import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  Disclaimer,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionTitle,
  Text,
} from '@/components/ui';
import { copy } from '@/constants/copy';
import { nextScanDate } from '@/lib/progress';
import { useProgressStore } from '@/stores/useProgressStore';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { spacing } from '@/theme/tokens';

import { HomeHeader } from './HomeHeader';
import { LatestScanCard } from './LatestScanCard';
import { RemindersCard } from './RemindersCard';
import { ScanCard } from './ScanCard';
import { TodayRoutine } from './TodayRoutine';

/** Skeleton lines shown until the first load finishes. */
const LOADING_LINES = 4;

/**
 * Where things stand today, under the big "Scan my skin" card that starts a
 * scan: the latest score, today's routine, the next reminder, and when the
 * next weekly scan is suggested. Each card leads to the screen with the detail, and the profile
 * button in the header opens Settings. The header and the scan card show in
 * every state, so scanning and Settings are always one tap away. It reads
 * the same stores as the Progress tab and the routine and refreshes them on
 * each visit, so all three always agree.
 *
 * Colour is by meaning, and sparing (see TintName): the brand teal scan
 * card, then the latest scan's card in apricot peach as the one tinted card.
 * The other cards are clean white, with their colour on a badge, a row or
 * an action: morning sun and evening dusk rows in the routine, a coral bell
 * on reminders and a mint calendar on the next scan. Never a different tint
 * on every card.
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
        <View style={styles.centered}>
          {status === 'error' ? (
            <ErrorState message={copy.home.loadFailed} onRetry={retry} />
          ) : status === 'ready' ? (
            // The scan card above is the way to the first scan. Peach, as the
            // latest scan's card will be once there is one.
            <Card tint="peach">
              <EmptyState title={copy.progress.noScans.title} body={copy.progress.noScans.body} />
            </Card>
          ) : (
            <LoadingState lines={LOADING_LINES} />
          )}
        </View>
      </Screen>
    );
  }

  const latest = records[records.length - 1].result;
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

      <ScanCard />

      <LatestScanCard latest={latest} />

      <TodayRoutine />

      <RemindersCard />

      <Card style={styles.card}>
        <SectionTitle title={copy.home.nextScan.title} icon="calendar" tint="mint" />
        <Text color="textSecondary">
          {next ? copy.home.nextScan.on(next) : copy.home.nextScan.now}
        </Text>
      </Card>

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
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
  },
  card: {
    gap: spacing.sm,
  },
});
