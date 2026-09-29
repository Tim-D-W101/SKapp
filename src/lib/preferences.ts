import * as SecureStore from 'expo-secure-store';

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
