import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, LoadingState, Screen, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { logInDevelopment } from '@/lib/errors';
import { dataNoticeAcceptedBy, markDataNoticeAccepted } from '@/lib/preferences';
import { useAuthStore } from '@/stores/useAuthStore';
import { sizes, spacing } from '@/theme/tokens';

export interface DataNoticeGateProps {
  children: ReactNode;
}

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/**
 * Before the camera is used for the first time, says plainly what happens to
 * the photo. "Continue" is remembered for this user; "Not now" leaves the
 * camera, and the notice shows again next time.
 */
export function DataNoticeGate({ children }: DataNoticeGateProps) {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [status, setStatus] = useState<'checking' | 'show' | 'accepted'>('checking');

  useEffect(() => {
    let current = true;
    dataNoticeAcceptedBy()
      .then((acceptedBy) => {
        if (current) setStatus(userId !== null && acceptedBy === userId ? 'accepted' : 'show');
      })
      .catch((error: unknown) => {
        // When in doubt, show it again.
        logInDevelopment('Could not read the data notice flag', error);
        if (current) setStatus('show');
      });
    return () => {
      current = false;
    };
  }, [userId]);

  const accept = () => {
    setStatus('accepted');
    if (!userId) return;
    markDataNoticeAccepted(userId).catch((error: unknown) => {
      // Worst case the notice shows once more next time.
      logInDevelopment('Could not save the data notice flag', error);
    });
  };

  if (status === 'accepted') return children;
  if (status === 'checking') {
    return (
      <Screen>
        <LoadingState variant="spinner" />
      </Screen>
    );
  }

  const text = copy.scan.dataNotice;
  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.body}>
        <Icon name="info" size={sizes.icon.xl} color="accent" />
        <Text variant="h1" accessibilityRole="header">
          {text.title}
        </Text>
        <View style={styles.points}>
          {text.points.map((point) => (
            <View key={point} style={styles.point}>
              <Icon name="check" size={sizes.icon.md} color="accent" />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <Button label={text.continue} onPress={accept} fullWidth />
        <Button label={text.notNow} onPress={leave} variant="ghost" fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  body: {
    gap: spacing.lg,
  },
  points: {
    gap: spacing.md,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pointText: {
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
  },
});
