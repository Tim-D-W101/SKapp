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
