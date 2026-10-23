import type { EntitlementStatus } from '@/lib/purchases';

/**
 * The tester-only "Preview premium" switch. Real subscriptions can't be
 * bought until the Play products exist, so a test build can offer a switch
 * that makes this phone's own checks count the user as subscribed, to see
 * and click through every premium screen.
 *
 * It only changes what the app shows. The analyze-scan Edge Function still
 * checks the subscription with RevenueCat itself before it analyses a scan
 * after the free one, so a premium scan can't finish with the switch alone.
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
