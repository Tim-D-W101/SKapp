import * as SecureStore from 'expo-secure-store';

import { parseAppearancePreference, type AppearancePreference } from '@/lib/appearance';

/**
 * Small on-device flags. They live in SecureStore only because it is the one
 * persistent key-value store the app already has; none of them is secret.
 */

const GHOST_TOOLTIP_KEY = 'glowtrack.ghost-tooltip-seen';

export async function hasSeenGhostTooltip(): Promise<boolean> {
  return (await SecureStore.getItemAsync(GHOST_TOOLTIP_KEY)) === 'true';
}

export async function markGhostTooltipSeen(): Promise<void> {
  await SecureStore.setItemAsync(GHOST_TOOLTIP_KEY, 'true');
}

const DATA_NOTICE_KEY = 'glowtrack.data-notice-accepted-by';

/**
 * The user who last accepted the notice about photos, shown before the first
 * camera use. Kept per user, so a new account on this phone sees it again.
 */
export async function dataNoticeAcceptedBy(): Promise<string | null> {
  return SecureStore.getItemAsync(DATA_NOTICE_KEY);
}

export async function markDataNoticeAccepted(userId: string): Promise<void> {
  await SecureStore.setItemAsync(DATA_NOTICE_KEY, userId);
}

const PREMIUM_PREVIEW_KEY = 'glowtrack.premium-preview-on';

/**
 * The tester-only "Preview premium" switch (lib/premiumPreview.ts). Kept on
 * this phone only, never sent anywhere.
 */
export async function isPremiumPreviewSaved(): Promise<boolean> {
  return (await SecureStore.getItemAsync(PREMIUM_PREVIEW_KEY)) === 'true';
}

export async function savePremiumPreview(on: boolean): Promise<void> {
  if (on) await SecureStore.setItemAsync(PREMIUM_PREVIEW_KEY, 'true');
  else await SecureStore.deleteItemAsync(PREMIUM_PREVIEW_KEY);
}

const APPEARANCE_KEY = 'glowtrack.appearance';

/**
 * Light, dark, or following the phone (lib/appearance.ts). Kept on this
 * phone only, and kept through signing out: it's how this phone looks, not
 * part of an account. Null when nothing is saved, as on a new install.
 */
export async function readSavedAppearance(): Promise<AppearancePreference | null> {
  return parseAppearancePreference(await SecureStore.getItemAsync(APPEARANCE_KEY));
}

export async function saveAppearance(preference: AppearancePreference): Promise<void> {
  await SecureStore.setItemAsync(APPEARANCE_KEY, preference);
}
