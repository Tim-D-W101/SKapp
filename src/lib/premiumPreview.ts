import type { EntitlementStatus } from '@/lib/purchases';

/**
 * The tester-only "Preview premium" switch. Real subscriptions can't be
 * bought until the Play products exist, so a test build can offer a switch
 * that makes this phone's own checks count the user as subscribed, to see
 * and click through every premium screen.
 *
 * On its own it only changes what the app shows: the analyze-scan Edge
 * Function checks the subscription with RevenueCat itself before it analyses
 * a scan after the free one, so the switch alone can't get a premium scan
 * analysed. A preview build published with the preview scan key
 * (`EXPO_PUBLIC_PREVIEW_BYPASS_TOKEN`) also sends that key with each scan
 * while the switch is on; the server lets those scans through only if the
 * key matches its own secret (supabase/functions/analyze-scan/preview.ts).
 * RevenueCat, purchases and restores are untouched, and analytics keep
 * reporting the real subscription.
 *
 * Pure, with type-only imports, so its test runs in plain Node.
 */

/**
 * The build-time flag that offers the switch. Set to "true" only in the EAS
 * `preview` environment; never set for production (docs/test-script.md).
 */
export const PREMIUM_PREVIEW_FLAG = 'EXPO_PUBLIC_ENABLE_PREMIUM_PREVIEW';

/**
 * The build-time variable holding the preview scan key. Set only in the EAS
 * `preview` environment, to the same value as the analyze-scan function's
 * PREVIEW_BYPASS_TOKEN secret; never for production (docs/ota-updates.md).
 */
export const PREVIEW_BYPASS_TOKEN_VAR = 'EXPO_PUBLIC_PREVIEW_BYPASS_TOKEN';

/** The header the key travels in. Must match `PREVIEW_BYPASS_HEADER` in supabase/functions/analyze-scan/preview.ts. */
export const PREVIEW_BYPASS_HEADER = 'x-preview-bypass-token';

/** The EAS Update channel production builds listen on (eas.json). */
export const PRODUCTION_CHANNEL = 'production';

export interface PreviewBuild {
  /** The flag's value, as written into the bundle when it was built. */
  flag: string | undefined;
  /** The update channel the build listens on, or null for development builds. */
  channel: string | null;
}

/**
 * Whether this build offers the switch at all: only with the flag set to
 * exactly "true", and never in a production build, even if the flag were set
 * there by mistake.
 */
export function isPremiumPreviewAvailable({ flag, channel }: PreviewBuild): boolean {
  if (flag !== 'true') return false;
  return channel?.trim().toLowerCase() !== PRODUCTION_CHANNEL;
}

/**
 * The entitlement the app's own checks go by: active while the preview is
 * on, otherwise RevenueCat's.
 */
export function entitlementWithPreview(
  entitlement: EntitlementStatus,
  previewOn: boolean,
): EntitlementStatus {
  return previewOn ? 'active' : entitlement;
}

/** The preview scan key, if this build has one: blank or missing means none. */
export function previewBypassToken(value: string | undefined): string | null {
  const token = value?.trim() ?? '';
  return token === '' ? null : token;
}

export interface PreviewScanState {
  /** This build offers the switch (isPremiumPreviewAvailable). */
  available: boolean;
  /** The switch is on. */
  enabled: boolean;
  /** The build's preview scan key, or null. */
  token: string | null;
}

/**
 * Extra headers for the analyze-scan call: the preview scan key, only in a
 * build that offers the switch, while it's on, and only if the build has a
 * key. Otherwise none, so every other build calls the function exactly as
 * before.
 */
export function previewScanHeaders({
  available,
  enabled,
  token,
}: PreviewScanState): Record<string, string> {
  if (!available || !enabled || token === null) return {};
  return { [PREVIEW_BYPASS_HEADER]: token };
}
