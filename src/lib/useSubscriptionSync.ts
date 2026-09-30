import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

/**
 * Keeps RevenueCat pointed at the signed-in Supabase user, and the
 * entitlement current: checked once a user exists, again whenever the user
 * changes, and whenever the app returns to the foreground.
 */
export function useSubscriptionSync(): void {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  useEffect(() => {
    if (userId) void useSubscriptionStore.getState().start(userId);
  }, [userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void useSubscriptionStore.getState().refresh();
    });
    return () => subscription.remove();
  }, []);
}
