import type { CustomerInfo } from 'react-native-purchases';
import { create } from 'zustand';

import { copy } from '@/constants/copy';
import { logInDevelopment } from '@/lib/errors';
import {
  entitlementStatus,
  fetchCustomerInfo,
  fetchPlans,
  identifyUser,
  isPurchasesConfigured,
  isPurchasesNetworkError,
  onCustomerInfoChange,
  purchasePlan,
  restorePurchases,
  subscriptionDetails,
  type EntitlementStatus,
  type Plan,
  type PurchaseOutcome,
  type RestoreOutcome,
  type SubscriptionDetails,
} from '@/lib/purchases';
import { useAuthStore } from '@/stores/useAuthStore';

/** The plans the paywall offers. */
export type OfferingsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; plans: Plan[] }
  | { status: 'error'; message: string };

interface SubscriptionState {
  /** RevenueCat's view of the premium entitlement for the signed-in user. */
  entitlement: EntitlementStatus;
  /** Subscribed now (a free trial counts): scanning after the free scan, the trend and comparisons. */
  isPremium: boolean;
  /** True while the entitlement is being checked and nothing is known yet. */
  isLoading: boolean;
  /** The active subscription's plan and dates, for Settings. Null without one. */
  details: SubscriptionDetails | null;
  offerings: OfferingsState;

  /** Links RevenueCat to the signed-in user and loads their entitlement. */
  start: (userId: string) => Promise<void>;
  /** Checks the entitlement again, for example when the app returns to the foreground. */
  refresh: () => Promise<void>;
  /** Fetches the plans. Plans already shown stay up while newer ones load. */
  loadOfferings: () => Promise<void>;
  purchase: (plan: Plan) => Promise<PurchaseOutcome>;
  restore: () => Promise<RestoreOutcome>;
  /** Forgets the entitlement, for when the signed-in user changes. */
  reset: () => void;
}

const signedOutState = {
  entitlement: 'unknown',
  isPremium: false,
  isLoading: true,
  details: null,
} as const satisfies Pick<SubscriptionState, 'entitlement' | 'isPremium' | 'isLoading' | 'details'>;

// Outside the store: neither is state any screen renders.
/** Bumped whenever the user changes, so an answer about the previous user is dropped. */
let userGeneration = 0;
/** Set while RevenueCat switches user. Updates arriving meanwhile may be about the old one. */
let switchingUser = false;
let listening = false;

export const useSubscriptionStore = create<SubscriptionState>()((set, get) => {
  const apply = (info: CustomerInfo) => {
    const entitlement = entitlementStatus(info);
    set({
      entitlement,
      isPremium: entitlement === 'active',
      isLoading: false,
      details: subscriptionDetails(info),
    });
  };

  return {
    ...signedOutState,
    offerings: { status: 'idle' },

    start: async (userId) => {
      const generation = ++userGeneration;
      switchingUser = true;
      try {
        const info = await identifyUser(userId);
        if (generation !== userGeneration) return;
        if (!listening) {
          listening = true;
          // Renewals, pending payments that go through, refunds: all arrive here.
          onCustomerInfoChange((update) => {
            if (!switchingUser) apply(update);
          });
        }
        apply(info);
      } catch (error: unknown) {
        if (generation !== userGeneration) return;
        // Unknown stays unknown: nothing is unlocked, and the server checks
        // for itself before any paid scan.
        logInDevelopment('Could not load the subscription', error);
        set({ isLoading: false });
      } finally {
        if (generation === userGeneration) switchingUser = false;
      }
    },

    refresh: async () => {
      if (!isPurchasesConfigured() || switchingUser) return;
      const generation = userGeneration;
      try {
        const info = await fetchCustomerInfo();
        if (generation === userGeneration) apply(info);
      } catch (error: unknown) {
        // Keeps the last known state. RevenueCat also serves it from its cache when offline.
        logInDevelopment('Could not refresh the subscription', error);
      }
    },

    loadOfferings: async () => {
      const { offerings } = get();
      if (offerings.status === 'loading') return;
      if (!isPurchasesConfigured()) {
        set({ offerings: { status: 'error', message: copy.paywall.unavailable } });
        return;
      }
      const shown = offerings.status === 'ready' ? offerings : null;
      if (!shown) set({ offerings: { status: 'loading' } });
      try {
        const plans = await fetchPlans();
        set({
          offerings:
            plans.length > 0
              ? { status: 'ready', plans }
              : { status: 'error', message: copy.paywall.unavailable },
        });
      } catch (error: unknown) {
        logInDevelopment('Could not load the plans', error);
        set({
          offerings: shown ?? {
            status: 'error',
            message: isPurchasesNetworkError(error)
              ? copy.paywall.plansFailed
              : copy.paywall.unavailable,
          },
        });
      }
    },

    purchase: async (plan) => {
      const generation = userGeneration;
      const outcome = await purchasePlan(plan);
      if (
        generation === userGeneration &&
        (outcome.kind === 'purchased' || outcome.kind === 'unconfirmed')
      ) {
        apply(outcome.info);
      }
      return outcome;
    },

    restore: async () => {
      const generation = userGeneration;
      const outcome = await restorePurchases();
      if (
        generation === userGeneration &&
        (outcome.kind === 'restored' || outcome.kind === 'nothingToRestore')
      ) {
        apply(outcome.info);
      }
      return outcome;
    },

    reset: () => {
      userGeneration += 1;
      set(signedOutState);
    },
  };
});

// A subscription belongs to one user. When the signed-in user changes
// (sign-out, account deletion, signing in elsewhere), forget what's known
// until RevenueCat has switched to the new one.
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) useSubscriptionStore.getState().reset();
});
