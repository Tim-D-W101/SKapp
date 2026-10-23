import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

/**
 * Back to the previous screen, or Home when there's nothing behind this one,
 * as when a link opened the app straight onto it.
 */
export function goBackOrHome(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/**
 * Makes Android's back button do the same while this screen is focused: with
 * nothing behind it, back goes Home instead of closing the app. Otherwise
 * the stack handles back as usual.
 */
export function useBackToHome(): void {
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (router.canGoBack()) return false;
        router.replace('/');
        return true;
      });
      return () => subscription.remove();
    }, []),
  );
}
