import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StartupScreen } from '@/components/auth/StartupScreen';
import { initCrashReporting } from '@/lib/crashReporting';
import { isOnboarded } from '@/lib/onboarding';
import { useAnalyticsSync } from '@/lib/useAnalyticsSync';
import { useReminderSync } from '@/lib/useReminderSync';
import { useSubscriptionSync } from '@/lib/useSubscriptionSync';
import { useAppearanceStore } from '@/stores/useAppearanceStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useColors, useColorSchemeName } from '@/theme/tokens';

// Before anything renders, so a crash during startup is reported too.
initCrashReporting();

/**
 * Root layout.
 *
 * Nothing routes until a user exists: on launch the auth store restores the
 * stored session or signs in anonymously, and until that resolves this shows
 * the startup screen (with a retry if it fails). Offline, a returning user
 * starts from the account and profile saved on the phone instead.
 *
 * Once a user exists, RevenueCat is configured with the same user id, so a
 * subscription and the account stay linked across reinstalls. Analytics and
 * crash reports use the same id.
 *
 * The guards then decide what is reachable. Until onboarding is complete only
 * the onboarding flow is; afterwards only the tabs and the screens that open
 * over them are. When a guard flips, the router moves to the first reachable
 * group listed below. Reminders are managed from then on, whichever screen
 * is showing.
 *
 * Nothing draws until the Appearance choice made in Settings has been read
 * from the phone, a moment at most, so the app never opens dark and then
 * turns light. The status bar's icons follow the same choice.
 */
export default function RootLayout() {
  const palette = useColors();
  const scheme = useColorSchemeName();
  const appearanceLoaded = useAppearanceStore((state) => state.loaded);
  const initialise = useAuthStore((state) => state.initialise);
  const isLoading = useAuthStore((state) => state.isLoading);
  const startupError = useAuthStore((state) => state.startupError);
  const hasProfile = useAuthStore((state) => state.user !== null && state.profile !== null);
  const onboarded = useAuthStore((state) => isOnboarded(state.profile));

  useEffect(() => {
    void initialise();
  }, [initialise]);

  const showsApp = !startupError && !isLoading && hasProfile;

  useSubscriptionSync();
  useAnalyticsSync();
  useReminderSync(showsApp && onboarded);

  if (!appearanceLoaded) return null;

  let content;
  if (startupError) {
    content = <StartupScreen error={startupError} onRetry={() => void initialise()} />;
  } else if (isLoading || !hasProfile) {
    content = <StartupScreen />;
  } else {
    content = (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="routine" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="scan" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="progress" />
          <Stack.Screen name="paywall" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="delete-account" options={{ animation: 'slide_from_bottom' }} />
        </Stack.Protected>
        <Stack.Screen name="(auth)" />
      </Stack>
    );
  }

  return (
    // Gestures anywhere in the app (the comparison slider) need this at the root.
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {content}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
