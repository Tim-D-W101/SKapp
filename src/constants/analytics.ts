/**
 * Coming back to the app after at least this long away counts as opening it
 * again (`app_opened`). Shorter trips out, such as the camera permission
 * prompt or the Google Play purchase sheet, don't.
 */
export const APP_REOPEN_AFTER_MS = 30 * 60 * 1000;

/** A scan started within this long of tapping a re-scan reminder is credited to it. */
export const REMINDER_ATTRIBUTION_MS = 60 * 60 * 1000;
