import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Screen, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import type { PaywallTrigger } from '@/constants/subscription';
import { useAuthStore } from '@/stores/useAuthStore';
import { sizes, spacing } from '@/theme/tokens';

export interface SubscribedPanelProps {
  trigger: PaywallTrigger;
  /** Unlocked by restoring an earlier purchase rather than a new one. */
  restored: boolean;
}

/**
 * Shown once the subscription is active. "Continue" carries on with whatever
 * opened the paywall. Someone still on an anonymous account is offered to
 * save it with their email: this is the moment it matters.
 */
export function SubscribedPanel({ trigger, restored }: SubscribedPanelProps) {
  const isAnonymous = useAuthStore((state) => state.isAnonymous);

  const next = () => {
    if (trigger === 'scan') router.replace('/scan/capture');
    else if (trigger === 'compare') router.replace('/progress/compare');
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Icon name="check" size={sizes.icon.xl} color="accent" />
        <Text variant="h1" align="center" accessibilityRole="header">
          {restored ? copy.paywall.subscribed.restoredTitle : copy.paywall.subscribed.title}
        </Text>
        <Text color="textSecondary" align="center">
          {copy.paywall.subscribed.body}
        </Text>
      </View>

      {isAnonymous ? (
        <Card style={styles.card}>
          <Text variant="h3" accessibilityRole="header">
            {copy.auth.saveProgress.title}
          </Text>
          <Text color="textSecondary">{copy.auth.saveProgress.body}</Text>
          <Button
            label={copy.auth.saveProgress.cta}
            onPress={() => router.push({ pathname: '/sign-in', params: { mode: 'save' } })}
            variant="secondary"
            fullWidth
          />
        </Card>
      ) : null}

      <Button label={copy.paywall.subscribed.continue} onPress={next} size="lg" fullWidth />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  card: {
    gap: spacing.md,
  },
});
