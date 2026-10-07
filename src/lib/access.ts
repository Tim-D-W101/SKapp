import { router } from 'expo-router';

import type { PaywallTrigger } from '@/constants/subscription';
import type { EntitlementStatus } from '@/lib/purchases';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

/**
 * What a subscription unlocks.
 * - The first scan is free. After it, a new scan needs a subscription.
 * - Results stay viewable forever. Nothing already shown is taken away.
 * - The trend and comparisons need a subscription, but someone whose
 *   subscription has lapsed keeps read access to everything they built up.
 *
 * These checks only decide what the app shows. The analyze-scan Edge Function
 * enforces the scan rule itself before it spends anything.
 */

/** Whether a new scan can start: yes, not without subscribing, or not known yet. */
export type ScanAccess = 'allowed' | 'subscribe' | 'checking';

export function scanAccess(
  freeScanUsed: boolean,
  entitlement: EntitlementStatus,
  isLoading: boolean,
): ScanAccess {
  if (!freeScanUsed || entitlement === 'active') return 'allowed';
  return entitlement === 'unknown' && isLoading ? 'checking' : 'subscribe';
}

/** Whether the trend and comparisons are open, locked, or not known yet. */
export type TrendsAccess = 'open' | 'locked' | 'checking';

export function trendsAccess(entitlement: EntitlementStatus, isLoading: boolean): TrendsAccess {
  if (entitlement === 'active' || entitlement === 'lapsed') return 'open';
  return entitlement === 'unknown' && isLoading ? 'checking' : 'locked';
}

export function useScanAccess(): ScanAccess {
  const freeScanUsed = useAuthStore((state) => state.profile?.free_scan_used ?? false);
  const entitlement = useSubscriptionStore((state) => state.entitlement);
  const isLoading = useSubscriptionStore((state) => state.isLoading);
  return scanAccess(freeScanUsed, entitlement, isLoading);
}

export function useTrendsAccess(): TrendsAccess {
  const entitlement = useSubscriptionStore((state) => state.entitlement);
  const isLoading = useSubscriptionStore((state) => state.isLoading);
  return trendsAccess(entitlement, isLoading);
}

export function openPaywall(trigger: PaywallTrigger): void {
  router.push({ pathname: '/paywall', params: { trigger } });
}

/** Opens the camera, or the paywall once the free scan is used and there's no subscription. */
export function startScan(): void {
  const freeScanUsed = useAuthStore.getState().profile?.free_scan_used ?? false;
  const { entitlement, isLoading } = useSubscriptionStore.getState();
  if (scanAccess(freeScanUsed, entitlement, isLoading) === 'subscribe') {
    openPaywall('scan');
  } else {
    // While it's still being checked, the camera screen waits for the answer.
    router.push('/scan/capture');
  }
}
