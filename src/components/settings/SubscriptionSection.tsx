import * as Linking from 'expo-linking';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button, Card, LoadingState, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { PLAY_SUBSCRIPTIONS_URL } from '@/constants/links';
import { formatShortDate } from '@/lib/dates';
import { logInDevelopment } from '@/lib/errors';
import type { SubscriptionDetails } from '@/lib/purchases';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { spacing } from '@/theme/tokens';

/** What the next date means: a renewal, the end, or the end of a free trial. */
function dateLine(details: SubscriptionDetails): string | null {
  if (!details.expiresAt) return null;
  const date = formatShortDate(details.expiresAt);
  if (details.isTrial) return copy.settings.subscription.trialEnds(date);
  return details.willRenew
    ? copy.settings.subscription.renews(date)
    : copy.settings.subscription.ends(date);
}

/**
 * The current plan and its next date, and a way to Google Play, where a
 * subscription is changed or cancelled. The app can't cancel one itself.
 */
export function SubscriptionSection() {
  const entitlement = useSubscriptionStore((state) => state.entitlement);
  const isLoading = useSubscriptionStore((state) => state.isLoading);
  const details = useSubscriptionStore((state) => state.details);
  const [error, setError] = useState<string | null>(null);

  const manage = () => {
    setError(null);
    Linking.openURL(details?.managementUrl ?? PLAY_SUBSCRIPTIONS_URL).catch(
      (openError: unknown) => {
        logInDevelopment('Could not open Google Play subscriptions', openError);
        setError(copy.settings.subscription.manageFailed);
      },
    );
  };

  let body;
  if (entitlement === 'unknown' && isLoading) {
    body = (
      <LoadingState variant="spinner" accessibilityLabel={copy.settings.subscription.checking} />
    );
  } else if (details) {
    const line = dateLine(details);
    body = (
      <>
        <Text>
          {copy.settings.subscription.plan(
            details.planId
              ? copy.paywall.plans[details.planId]
              : copy.settings.subscription.otherPlan,
          )}
        </Text>
        {line ? <Text color="textSecondary">{line}</Text> : null}
      </>
    );
  } else {
    body = (
      <Text color="textSecondary">
        {entitlement === 'lapsed'
          ? copy.settings.subscription.lapsed
          : copy.settings.subscription.none}
      </Text>
    );
  }

  return (
    <Card style={styles.card}>
      <Text variant="h3" accessibilityRole="header">
        {copy.settings.subscription.title}
      </Text>
      {body}
      {details || entitlement === 'lapsed' ? (
        <Button
          label={copy.settings.subscription.manage}
          accessibilityHint={copy.settings.subscription.manageHint}
          onPress={manage}
          variant="secondary"
          fullWidth
        />
      ) : null}
      {error ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
});
