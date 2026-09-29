/**
 * Public web pages the app opens. The stores require the paywall to link to
 * both. They are drafted in Phase 12 and must be live, as web pages, before
 * release. Set the addresses in .env, and in EAS for cloud builds. Null until
 * they are set.
 */
export const LEGAL_LINKS = {
  terms: process.env.EXPO_PUBLIC_TERMS_URL || null,
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL || null,
} as const;

/**
 * The address Settings' "Contact support" writes to, and the one data
 * requests go to under the Privacy Policy. Null until it is set.
 */
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || null;

/** Google Play's list of the person's subscriptions, when RevenueCat has no direct link. */
export const PLAY_SUBSCRIPTIONS_URL = 'https://play.google.com/store/account/subscriptions';
