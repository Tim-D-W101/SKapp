import { Appearance } from 'react-native';
import { create } from 'zustand';

import { DEFAULT_APPEARANCE, type AppearancePreference } from '@/lib/appearance';
import { logInDevelopment } from '@/lib/errors';
import { readSavedAppearance, saveAppearance } from '@/lib/preferences';
import { withTimeout } from '@/lib/timeout';

/**
 * The longest the first screen waits for the saved choice. Reading it takes
 * a moment; past this the app follows the phone rather than stay blank.
 */
const LOAD_TIMEOUT_MS = 1000;

interface AppearanceState {
  /** System, Light or Dark, as chosen under Appearance in Settings. */
  preference: AppearancePreference;
  /**
   * The saved choice has been read, or reading it failed. Until then the app
   * draws nothing, so it never opens in the wrong colours and then switches.
   */
  loaded: boolean;
  /** The saved choice couldn't be read, or a change couldn't be saved. */
  error: 'load' | 'save' | null;
  /** Reads the saved choice from this phone. */
  load: () => Promise<void>;
  /** Switches the app's colours straight away, and saves the choice on this phone. */
  setPreference: (preference: AppearancePreference) => Promise<void>;
}

/**
 * Tells Android too, so what it draws itself (alerts, the keyboard, the
 * status bar) matches the app's colours. 'unspecified' hands it back to the
 * phone's own setting. The app's own colours never wait on this: useColors
 * reads the choice directly (theme/tokens.ts).
 */
function applyToNative(preference: AppearancePreference): void {
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
}

export const useAppearanceStore = create<AppearanceState>()((set, get) => ({
  preference: DEFAULT_APPEARANCE,
  loaded: false,
  error: null,

  load: async () => {
    try {
      const saved =
        (await withTimeout(readSavedAppearance(), LOAD_TIMEOUT_MS)) ?? DEFAULT_APPEARANCE;
      set({ preference: saved, loaded: true, error: null });
      applyToNative(saved);
    } catch (error: unknown) {
      // Follows the phone: the colours it would have had before this setting existed.
      logInDevelopment('Could not read the appearance setting', error);
      set({ preference: DEFAULT_APPEARANCE, loaded: true, error: 'load' });
      applyToNative(DEFAULT_APPEARANCE);
    }
  },

  setPreference: async (preference) => {
    const previous = get().preference;
    if (preference === previous) return;
    set({ preference, error: null });
    applyToNative(preference);
    try {
      await saveAppearance(preference);
    } catch (error: unknown) {
      // Back to the choice that is saved, so the app looks the same next time it opens.
      logInDevelopment('Could not save the appearance setting', error);
      set({ preference: previous, error: 'save' });
      applyToNative(previous);
    }
  },
}));

// Read once at startup, before the first screen draws (see app/_layout.tsx).
void useAppearanceStore.getState().load();
