import * as Updates from 'expo-updates';
import { create } from 'zustand';

import { logInDevelopment } from '@/lib/errors';
import { isPremiumPreviewAvailable } from '@/lib/premiumPreview';
import { isPremiumPreviewSaved, savePremiumPreview } from '@/lib/preferences';

/**
 * Whether this build offers the tester-only "Preview premium" switch. Fixed
 * for the life of the bundle. The flag is read in full, as
 * `process.env.EXPO_PUBLIC_...`, so Expo writes its value into the bundle.
 */
export const PREMIUM_PREVIEW_AVAILABLE = isPremiumPreviewAvailable({
  flag: process.env.EXPO_PUBLIC_ENABLE_PREMIUM_PREVIEW,
  channel: Updates.channel,
});

interface PremiumPreviewState {
  /** The switch is on. Always false in a build that doesn't offer it. */
  enabled: boolean;
  /** The saved setting couldn't be read, or a change couldn't be saved. */
  error: 'load' | 'save' | null;
  /** Reads the saved setting from this phone. */
  load: () => Promise<void>;
  /** Turns the preview on or off, and saves it on this phone. */
  setEnabled: (enabled: boolean) => Promise<void>;
}

export const usePremiumPreviewStore = create<PremiumPreviewState>()((set, get) => ({
  enabled: false,
  error: null,

  load: async () => {
    if (!PREMIUM_PREVIEW_AVAILABLE) return;
    try {
      const saved = await isPremiumPreviewSaved();
      set({ enabled: saved, error: null });
    } catch (error: unknown) {
      // Stays off: nothing is unlocked without a setting that was read.
      logInDevelopment('Could not read the premium preview setting', error);
      set({ enabled: false, error: 'load' });
    }
  },

  setEnabled: async (enabled) => {
    if (!PREMIUM_PREVIEW_AVAILABLE) return;
    const previous = get().enabled;
    set({ enabled, error: null });
    try {
      await savePremiumPreview(enabled);
    } catch (error: unknown) {
      logInDevelopment('Could not save the premium preview setting', error);
      set({ enabled: previous, error: 'save' });
    }
  },
}));

// Read once at startup, so the premium screens open straight away on a
// test build where the switch was left on.
if (PREMIUM_PREVIEW_AVAILABLE) void usePremiumPreviewStore.getState().load();
