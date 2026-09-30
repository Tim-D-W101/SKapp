import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Disclaimer,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  Text,
} from '@/components/ui';
import { copy } from '@/constants/copy';
import { startScan, useTrendsAccess } from '@/lib/access';
import { track } from '@/lib/analytics';
import { useProgressStore } from '@/stores/useProgressStore';
import { spacing } from '@/theme/tokens';

import { CompareEntry } from './CompareEntry';
import { LockedProgress } from './LockedProgress';
import { ProgressHero } from './ProgressHero';
import { ProgressTrend } from './ProgressTrend';
import { ScanHistory } from './ScanHistory';
import { StreakCard } from './StreakCard';

/**
 * The product: how the skin's appearance has moved over weeks. Refreshes
 * each time the tab is opened, keeping what's shown while it does.
 *
 * The trend and comparisons need a subscription (or a lapsed one: nothing
 * already built up is taken away). The latest score and the scan history
 * stay open to everyone, so the free scan's result is always reachable.
 */
export function ProgressScreen() {
  const status = useProgressStore((state) => state.status);
  const records = useProgressStore((state) => state.records);
  const refreshFailed = useProgressStore((state) => state.refreshFailed);
  const load = useProgressStore((state) => state.load);
  const loadPhotos = useProgressStore((state) => state.loadPhotos);
  const trends = useTrendsAccess();

  // Counted once per visit to the tab: straight away when the history is
  // already there, otherwise as soon as it has loaded.
  const visitPending = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const current = useProgressStore.getState();
      if (current.status === 'ready') {
        track('progress_viewed', { scan_count: current.records.length });
      } else {
        visitPending.current = true;
      }
      void load();
    }, [load]),
  );

  useEffect(() => {
    if (!visitPending.current || status !== 'ready') return;
    visitPending.current = false;
    track('progress_viewed', { scan_count: records.length });
  }, [status, records.length]);

  // One request signs every thumbnail's link.
  useEffect(() => {
    if (records.length > 0) void loadPhotos(records.map((record) => record.imagePath));
  }, [records, loadPhotos]);

  const retry = () => void load();

  if (records.length === 0) {
    return (
      <Screen edges={['top', 'right', 'left']} contentStyle={styles.centered}>
        {status === 'error' ? (
          <ErrorState message={copy.progress.loadFailed} onRetry={retry} />
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
          <LoadingState lines={4} />
        )}
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['top', 'right', 'left']} contentStyle={styles.content}>
      <Text variant="h1" accessibilityRole="header">
        {copy.progress.title}
      </Text>

      {refreshFailed ? (
        <View style={styles.notice} accessibilityLiveRegion="polite">
          <Text variant="bodySmall" color="textSecondary" style={styles.noticeText}>
            {copy.progress.loadFailed}
          </Text>
          <Button label={copy.common.retry} onPress={retry} variant="ghost" size="sm" />
        </View>
      ) : null}

      <ProgressHero records={records} />
      {trends === 'open' ? (
        <>
          <ProgressTrend records={records} />
          <CompareEntry scanCount={records.length} />
        </>
      ) : trends === 'checking' ? (
        <LoadingState lines={3} />
      ) : (
        <LockedProgress />
      )}
      <StreakCard scanDates={records.map((record) => record.result.createdAt)} />
      <ScanHistory records={records} />
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
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
  },
});
