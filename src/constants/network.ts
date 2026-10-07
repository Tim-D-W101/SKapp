/**
 * How long a request to Supabase may run before it's abandoned. React Native's
 * fetch has no timeout of its own, so without these a stalled connection would
 * leave a button spinning for good.
 */
export const REQUEST_TIMEOUT_MS = 20_000;

/** Photo uploads carry a few hundred kilobytes, which a slow connection needs longer for. */
export const UPLOAD_TIMEOUT_MS = 90_000;

/** The analysis only replies once it has finished, which can take most of a minute. */
export const FUNCTION_TIMEOUT_MS = 90_000;
