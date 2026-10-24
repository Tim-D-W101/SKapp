/** How far ahead reminders are scheduled. The plan is rebuilt on every app open and after each scan. */
export const REMINDER_HORIZON_DAYS = 14;

/**
 * Where the time picker starts for a morning or evening routine reminder
 * that has never been set. Only a starting point: the reminder itself always
 * comes at the time the person picks and saves.
 */
export const ROUTINE_REMINDER_START_TIMES = {
  morning: { hour: 8, minute: 0 },
  evening: { hour: 20, minute: 0 },
} as const;

/** When a streak-at-risk reminder arrives, on the last day of the week. */
export const STREAK_REMINDER_HOUR = 18;

/** A streak worth protecting: this many weeks or more. */
export const STREAK_REMINDER_MIN_WEEKS = 2;

/** How many visits to the routine tab before a routine reminder is offered. */
export const ROUTINE_VISITS_BEFORE_OFFER = 2;

/** The Android notification channel every reminder uses. */
export const REMINDER_CHANNEL_ID = 'reminders';
