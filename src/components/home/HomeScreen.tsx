import { router, useFocusEffect } from 'expo-router';
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
  ScoreRing,
  SectionTitle,
  Text,
} from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatShortDate } from '@/lib/dates';
import { nextScanDate } from '@/lib/progress';
import { useProgressStore } from '@/stores/useProgressStore';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { spacing } from '@/theme/tokens';

import { HomeHeader } from './HomeHeader';
import { ScanCard } from './ScanCard';
import { TodayRoutine } from './TodayRoutine';

/** Skeleton lines shown until the first load finishes. */
const LOADING_LINES = 4;

/**
 * Where things stand today, under the big "Scan my skin" card that starts a
 * scan: the latest score, today's routine, and when the next weekly scan is
 * suggested. Each card leads to the screen with the detail, and the profile
 * button in the header opens Settings. The header and the scan card show in
 * every state, so scanning and Settings are always one tap away. It reads
 * the same stores as the Progress tab and the routine and refreshes them on
 * each visit, so all three always agree.
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
            // The scan card above is the way to the first scan.
            <EmptyState title={copy.progress.noScans.title} body={copy.progress.noScans.body} />
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

      <Card style={styles.latest} elevation="md" tint="sky">
        <ScoreRing score={latest.overall} label={copy.progress.latest} trackColor="background" />
        <Text variant="bodySmall" color="textSecondary" align="center">
          {copy.home.latestDate(formatShortDate(latest.createdAt))}
        </Text>
        <Button
          label={copy.home.seeResults}
          onPress={() => router.push(`/progress/${latest.scanId}`)}
          variant="secondary"
          fullWidth
        />
      </Card>

      <TodayRoutine />

      <Card style={styles.card} tint="coral">
        <SectionTitle title={copy.home.nextScan.title} icon="calendar" tint="coral" />
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
  latest: {
    alignItems: 'center',
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
});
