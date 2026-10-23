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
  SunMark,
  Text,
} from '@/components/ui';
import { copy } from '@/constants/copy';
import { startScan } from '@/lib/access';
import { formatShortDate } from '@/lib/dates';
import { nextScanDate } from '@/lib/progress';
import { tickKey } from '@/lib/routine';
import { useProgressStore } from '@/stores/useProgressStore';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { sizes, spacing } from '@/theme/tokens';

/** Skeleton lines shown until the first load finishes. */
const LOADING_LINES = 4;

/**
 * Where things stand today: the latest score, when the next weekly scan is
 * suggested, and how today's routine is going. Each card leads to the screen
 * with the detail. It reads the same stores as the Progress and Routine tabs
 * and refreshes them on each visit, so all three always agree.
 */
export function HomeScreen() {
  const status = useProgressStore((state) => state.status);
  const records = useProgressStore((state) => state.records);
  const refreshFailed = useProgressStore((state) => state.refreshFailed);
  const loadProgress = useProgressStore((state) => state.load);
  const routine = useRoutineStore((state) => state.routine);
  const ticked = useRoutineStore((state) => state.ticked);
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
      <Screen edges={['top', 'right', 'left']} contentStyle={styles.centered}>
        {status === 'error' ? (
          <ErrorState message={copy.home.loadFailed} onRetry={retry} />
        ) : status === 'ready' ? (
          <EmptyState
            title={copy.progress.noScans.title}
            body={copy.progress.noScans.body}
            action={{
              label: copy.progress.noScans.cta,
              onPress: startScan,
            }}
          />
        ) : (
          <LoadingState lines={LOADING_LINES} />
        )}
      </Screen>
    );
  }

  const latest = records[records.length - 1].result;
  const next = nextScanDate(latest.createdAt);
  const done = routine
    ? routine.steps.filter((step) => ticked[tickKey(step.slot, step.key)]).length
    : 0;

  return (
    <Screen scroll edges={['top', 'right', 'left']} contentStyle={styles.content}>
      <View style={styles.header}>
        <SunMark width={sizes.sunMark.sm} />
        <Text variant="h1" accessibilityRole="header">
          {copy.home.title}
        </Text>
      </View>

      {refreshFailed ? (
        <View style={styles.notice} accessibilityLiveRegion="polite">
          <Text variant="bodySmall" color="textSecondary" style={styles.noticeText}>
            {copy.home.loadFailed}
          </Text>
          <Button label={copy.common.retry} onPress={retry} variant="ghost" size="sm" />
        </View>
      ) : null}

      <Card style={styles.latest} elevation="md">
        <ScoreRing score={latest.overall} label={copy.progress.latest} />
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

      <Card style={styles.card}>
        <Text variant="h3" accessibilityRole="header">
          {copy.home.nextScan.title}
        </Text>
        <Text color="textSecondary">
          {next ? copy.home.nextScan.on(next) : copy.home.nextScan.now}
        </Text>
        <Button
          label={copy.home.nextScan.cta}
          onPress={startScan}
          variant={next ? 'secondary' : 'primary'}
          fullWidth
        />
      </Card>

      {routine ? (
        <Card style={styles.card}>
          <Text variant="h3" accessibilityRole="header">
            {copy.home.routine.title}
          </Text>
          <Text color="textSecondary">{copy.routine.completion(done, routine.steps.length)}</Text>
          <Button
            label={copy.home.routine.open}
            onPress={() => router.navigate('/routine')}
            variant="secondary"
            fullWidth
          />
        </Card>
      ) : null}

      <Disclaimer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
  },
  content: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  latest: {
    alignItems: 'center',
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
});
