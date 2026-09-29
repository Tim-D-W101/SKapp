import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { APP_REOPEN_AFTER_MS } from '@/constants/analytics';
import { identifyUser, resetAnalytics, setPersonProperties, track } from '@/lib/analytics';
import {
  daysSinceInstall,
  loadInstallInfo,
  noteRescanReminderOpened,
  refreshScanStats,
} from '@/lib/analyticsContext';
import { setCrashReportingUser } from '@/lib/crashReporting';
import { onRescanReminderOpened } from '@/lib/notifications';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

/**
 * Keeps analytics and crash reports pointed at the signed-in user, and
 * records the events no single screen owns: opening the app, and opening it
 * from a re-scan reminder.
 */
export function useAnalyticsSync(): void {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const skinType = useAuthStore((state) => state.profile?.skin_type ?? null);
  const ageBand = useAuthStore((state) => state.profile?.age_band ?? null);
  const concernCount = useAuthStore((state) => state.profile?.concerns.length ?? 0);
  const entitlement = useSubscriptionStore((state) => state.entitlement);
  const identified = useRef<string | null>(null);

  // Opening the app: at launch, and on coming back after a long time away.
  useEffect(() => {
    const opened = (isFirstOpen: boolean) => {
      const days = daysSinceInstall();
      track('app_opened', { is_first_open: isFirstOpen, days_since_install: days });
      if (days !== null) setPersonProperties({ days_since_install: days });
    };
    void loadInstallInfo().then((info) => opened(info.isFirstOpen));

    let leftAt: number | null = null;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        leftAt = Date.now();
      } else if (state === 'active' && leftAt !== null) {
        if (Date.now() - leftAt >= APP_REOPEN_AFTER_MS) opened(false);
        leftAt = null;
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => onRescanReminderOpened(() => noteRescanReminderOpened()), []);

  useEffect(() => {
    if (!userId) return;
    // A different person on this phone: never merge the two.
    if (identified.current !== null && identified.current !== userId) resetAnalytics();
    identified.current = userId;
    identifyUser(userId);
    setCrashReportingUser(userId);
    void refreshScanStats(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const days = daysSinceInstall();
    setPersonProperties({
      skin_type: skinType,
      age_band: ageBand,
      concern_count: concernCount,
      // Only once RevenueCat has answered, so nobody is briefly recorded as not subscribed.
      is_premium: entitlement === 'unknown' ? undefined : entitlement === 'active',
      days_since_install: days ?? undefined,
    });
  }, [userId, skinType, ageBand, concernCount, entitlement]);
}
