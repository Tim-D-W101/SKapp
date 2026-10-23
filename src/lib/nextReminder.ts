import type { PermissionState } from '@/lib/notifications';
import type { PlannedReminder } from '@/lib/reminderPlan';

/**
 * What the reminders card on Home shows: the next reminder in the plan the
 * reminder store last scheduled, or why there isn't one. It reads that plan
 * and never builds one of its own, so the card always matches what is
 * really scheduled on the phone.
 *
 * Pure, with type-only imports, so its test runs in plain Node.
 */

/** What a reminder is called on the card. A routine reminder is named for its time of day. */
export type ReminderName = 'weekly' | 'streak' | 'morning' | 'evening';

/** A reminder's day, by the phone's calendar: today, tomorrow, a day in the next week, or later. */
export type RelativeDay =
  | { kind: 'today' }
  | { kind: 'tomorrow' }
  /** 0 is Sunday, as in Date.getDay(). */
  | { kind: 'weekday'; weekday: number }
  | { kind: 'later' };

export type RemindersCardState =
  /** The settings, the permission or the plan are still on their way. */
  | { kind: 'loading' }
  /** The plan couldn't be made, most likely offline. */
  | { kind: 'failed' }
  /** Notifications haven't been allowed yet: the explanation comes before the system prompt. */
  | { kind: 'needsPermission' }
  /** Notifications were refused: only the phone's settings can turn them back on. */
  | { kind: 'blocked' }
  /** The master switch is off. */
  | { kind: 'off' }
  /** Reminders are on, but nothing switched on is due in the plan. */
  | { kind: 'none' }
  | { kind: 'next'; name: ReminderName; date: Date };

export interface RemindersCardInputs {
  now: Date;
  /** The reminder settings and the permission have been read. */
  loaded: boolean;
  permission: PermissionState;
  /** The master switch. */
  enabled: boolean;
  /** The plan last scheduled, soonest first, or null until one has been made. */
  plan: readonly PlannedReminder[] | null;
  /** The last attempt to make the plan failed. */
  planFailed: boolean;
  /** When the morning and evening routine reminders arrive, in local hours. */
  routineHours: Readonly<Record<'morning' | 'evening', number>>;
}

/** The card's state, from the reminder store. Permission comes first, then the master switch. */
export function remindersCardState(inputs: RemindersCardInputs): RemindersCardState {
  const { now, loaded, permission, enabled, plan, planFailed, routineHours } = inputs;
  if (!loaded) return { kind: 'loading' };
  if (permission === 'undetermined') return { kind: 'needsPermission' };
  if (permission === 'denied') return { kind: 'blocked' };
  if (!enabled) return { kind: 'off' };
  // A plan made earlier still describes what's scheduled, even if a later attempt failed.
  if (!plan) return { kind: planFailed ? 'failed' : 'loading' };
  const next = plan.find((reminder) => reminder.date.getTime() > now.getTime());
  if (!next) return { kind: 'none' };
  return { kind: 'next', name: reminderName(next, routineHours), date: next.date };
}

/** What to call a planned reminder. The plan only says "routine", so the hour tells morning from evening. */
export function reminderName(
  reminder: Pick<PlannedReminder, 'kind' | 'date'>,
  routineHours: Readonly<Record<'morning' | 'evening', number>>,
): ReminderName {
  if (reminder.kind !== 'routine') return reminder.kind;
  return reminder.date.getHours() === routineHours.morning ? 'morning' : 'evening';
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_IN_WEEK = 7;

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** `date`'s day, relative to `now`'s, in the phone's time zone. */
export function relativeDay(date: Date, now: Date): RelativeDay {
  // Rounding absorbs the hour a daylight-saving change adds or removes.
  const days = Math.round((startOfLocalDay(date) - startOfLocalDay(now)) / MS_PER_DAY);
  if (days <= 0) return { kind: 'today' };
  if (days === 1) return { kind: 'tomorrow' };
  if (days < DAYS_IN_WEEK) return { kind: 'weekday', weekday: date.getDay() };
  return { kind: 'later' };
}
