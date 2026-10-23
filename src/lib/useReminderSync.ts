import { useEffect } from 'react';
import { AppState } from 'react-native';

import { configureNotifications } from '@/lib/notifications';
import { useReminderStore } from '@/stores/useReminderStore';

/**
 * Keeps scheduled reminders up to date while `enabled`: as soon as it's
 * enabled and whenever the app comes back to the foreground, the plan is
 * rebuilt from the latest scans and settings. Never asks for permission.
 * The root layout enables it once onboarding is done.
 */
export function useReminderSync(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    configureNotifications();
    const { load, reschedule } = useReminderStore.getState();
    void load().then(reschedule);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      // The permission may have been changed in the phone's settings meanwhile.
      void load().then(reschedule);
    });
    return () => subscription.remove();
  }, [enabled]);
}
