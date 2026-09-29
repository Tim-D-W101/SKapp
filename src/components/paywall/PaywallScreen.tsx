import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, ErrorState, Icon, LoadingState, Screen, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { LEGAL_LINKS } from '@/constants/links';
import { DEFAULT_PLAN, type PaywallTrigger, type PlanId } from '@/constants/subscription';
import { track, type PurchaseFailureReason } from '@/lib/analytics';
import { completedScanCount } from '@/lib/analyticsContext';
import { formatShortDate } from '@/lib/dates';
import {
  annualSaving,
  trialEndDate,
  type Plan,
  type PurchaseOutcome,
  type RestoreOutcome,
} from '@/lib/purchases';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { sizes, spacing } from '@/theme/tokens';

import { LegalLink } from './LegalLink';
import { PlanCard } from './PlanCard';
import { SubscribedPanel } from './SubscribedPanel';

export interface PaywallScreenProps {
  trigger: PaywallTrigger;
}

type Busy = 'purchase' | 'restore' | null;

type FailureKind = Exclude<PurchaseOutcome['kind'], 'purchased' | 'unconfirmed' | 'cancelled'>;

const FAILURE_REASONS: Record<FailureKind, PurchaseFailureReason> = {
  pending: 'payment_pending',
  alreadySubscribed: 'already_subscribed',
  storeUnavailable: 'store_unavailable',
  network: 'network',
  failed: 'unknown',
};

const RESTORE_MESSAGES: Record<Exclude<RestoreOutcome['kind'], 'restored'>, string> = {
  nothingToRestore: copy.paywall.outcomes.nothingToRestore,
  inUseElsewhere: copy.paywall.outcomes.inUseElsewhere,
  failed: copy.paywall.outcomes.restoreFailed,
};

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** The exact terms of the selected plan: what is charged, from when, and that it renews. */
function termsFor(plan: Plan, openedAt: Date): string {
  if (!plan.trial) return copy.paywall.terms(plan.priceString, plan.id);
  const { count, unit } = plan.trial;
  const firstCharge = formatShortDate(trialEndDate(plan.trial, openedAt).toISOString());
  return copy.paywall.trialTerms(count, unit, plan.priceString, plan.id, firstCharge);
}

/**
 * The paywall, honest by design (the rules are at the top of copy.paywall):
 * the billed amount on every plan, the exact terms right under the button,
 * a close button that is always on screen, and nothing that counts down.
 */
export function PaywallScreen({ trigger }: PaywallScreenProps) {
  const isPremium = useSubscriptionStore((state) => state.isPremium);
  const entitlement = useSubscriptionStore((state) => state.entitlement);
  const offerings = useSubscriptionStore((state) => state.offerings);
  const loadOfferings = useSubscriptionStore((state) => state.loadOfferings);
  const refresh = useSubscriptionStore((state) => state.refresh);
  const purchase = useSubscriptionStore((state) => state.purchase);
  const restore = useSubscriptionStore((state) => state.restore);

  const [openedAt] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState<PlanId>(DEFAULT_PLAN);
  const [busy, setBusy] = useState<Busy>(null);
  const [restored, setRestored] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    track('paywall_viewed', { trigger, scan_number: completedScanCount() });
  }, [trigger]);

  useEffect(() => {
    void loadOfferings();
    // Someone may have subscribed elsewhere since the app last checked.
    void refresh();
  }, [loadOfferings, refresh]);

  if (isPremium) {
    return <SubscribedPanel trigger={trigger} restored={restored || busy === 'restore'} />;
  }

  const plans = offerings.status === 'ready' ? offerings.plans : [];
  const selected = plans.find((plan) => plan.id === selectedId) ?? plans[0] ?? null;
  const saving = annualSaving(plans);

  const choose = (plan: Plan) => {
    setSelectedId(plan.id);
    setMessage(null);
    track('plan_selected', { plan_id: plan.id });
  };

  const buy = async (plan: Plan) => {
    setBusy('purchase');
    setMessage(null);
    track('purchase_started', { plan_id: plan.id });
    const outcome = await purchase(plan);
    setBusy(null);

    switch (outcome.kind) {
      case 'purchased':
      case 'unconfirmed':
        track('purchase_completed', {
          plan_id: plan.id,
          price: plan.price,
          currency: plan.currencyCode,
          is_trial: plan.trial !== null,
        });
        // Once it's active the store says so, and the subscribed panel takes over.
        if (outcome.kind === 'unconfirmed') setMessage(copy.paywall.outcomes.unconfirmed);
        return;
      case 'cancelled':
        track('purchase_cancelled', { plan_id: plan.id });
        setMessage(copy.paywall.outcomes.cancelled);
        return;
      default:
        track('purchase_failed', { plan_id: plan.id, reason: FAILURE_REASONS[outcome.kind] });
        setMessage(copy.paywall.outcomes[outcome.kind]);
    }
  };

  const handleRestore = async () => {
    setBusy('restore');
    setMessage(null);
    const outcome = await restore();
    setBusy(null);
    if (outcome.kind === 'restored') setRestored(true);
    else setMessage(RESTORE_MESSAGES[outcome.kind]);
  };

  const linkFailed = () => setMessage(copy.paywall.linkFailed);

  return (
    <Screen padded={false}>
      {/* Outside the scroll view, so it never scrolls out of reach. */}
      <View style={styles.topBar}>
        <Button
          label={copy.paywall.close}
          leadingIcon="close"
          onPress={close}
          variant="ghost"
          size="sm"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h1" accessibilityRole="header">
          {copy.paywall.title}
        </Text>
        {entitlement === 'lapsed' ? <Text color="textSecondary">{copy.paywall.lapsed}</Text> : null}

        <View style={styles.points}>
          {copy.paywall.valuePoints.map((point) => (
            <View key={point} style={styles.point}>
              <Icon name="check" size={sizes.icon.md} color="accent" />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>

        {selected ? (
          <>
            <View
              style={styles.plans}
              accessibilityRole="radiogroup"
              accessibilityLabel={copy.paywall.plansLabel}
            >
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={plan.id === selected.id}
                  badge={
                    plan.id === 'annual' && saving !== null ? copy.paywall.bestValue(saving) : null
                  }
                  disabled={busy !== null}
                  onSelect={() => choose(plan)}
                />
              ))}
            </View>

            <View style={styles.purchase}>
              <Button
                label={
                  selected.trial
                    ? copy.paywall.startTrial(selected.trial.count, selected.trial.unit)
                    : copy.paywall.subscribe
                }
                onPress={() => void buy(selected)}
                loading={busy === 'purchase'}
                disabled={busy !== null}
                size="lg"
                fullWidth
              />
              {/* Directly under the button, in plain body text: the exact terms. */}
              <Text>{termsFor(selected, openedAt)}</Text>
            </View>
          </>
        ) : offerings.status === 'error' ? (
          <ErrorState message={offerings.message} onRetry={() => void loadOfferings()} />
        ) : (
          <LoadingState lines={4} accessibilityLabel={copy.paywall.loadingPlans} />
        )}

        {message ? (
          <Text color="textSecondary" accessibilityLiveRegion="polite">
            {message}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Button
            label={copy.paywall.restore}
            onPress={() => void handleRestore()}
            loading={busy === 'restore'}
            disabled={busy !== null}
            variant="ghost"
          />
          <View style={styles.links}>
            <LegalLink label={copy.paywall.termsLink} url={LEGAL_LINKS.terms} onFail={linkFailed} />
            <LegalLink
              label={copy.paywall.privacyLink}
              url={LEGAL_LINKS.privacy}
              onFail={linkFailed}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.md,
  },
  points: {
    gap: spacing.sm,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pointText: {
    flex: 1,
  },
  plans: {
    gap: spacing.sm,
  },
  purchase: {
    gap: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  links: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
});
