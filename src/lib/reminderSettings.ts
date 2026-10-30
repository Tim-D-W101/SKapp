import * as SecureStore from 'expo-secure-store';

import { ROUTINE_REMINDER_START_TIMES } from '@/constants/reminders';
import { logInDevelopment } from '@/lib/errors';
import type { ReminderTime, RoutineReminderSlot } from '@/lib/reminderPlan';
import type { RoutineSlot } from '@/types/routine';

/**
 * Reminder settings that belong to this phone rather than the account: the
 * notifications live here. The weekly reminder's day and hour are on the
 * profile instead. Kept in SecureStore, the one small persistent store the
 * app already has; none of it is secret.
 */
export interface ReminderSettings {
  /** The master switch. */
  enabled: boolean;
  /**
   * The minutes past the weekly scan reminder's hour, so it can come at any
   * time the person picks. The hour stays on the profile, which has no column
   * for minutes; on a new phone the reminder comes on the hour until a time
   * is picked again.
   */
  weeklyMinute: number;
  streak: boolean;
  routine: RoutineReminderSlot;
  /**
   * When the morning and the evening routine reminder arrive: any local time
   * the person picks. Each keeps its own time, so switching between them
   * never loses one. Until one is set, the picker starts from a suggestion.
   */
  routineTimes: Record<RoutineSlot, ReminderTime>;
  /** The explanation before the system permission prompt has been shown. */
  introSeen: boolean;
  /** Visits to the routine tab. A routine reminder is only offered there after a couple. */
  routineVisits: number;
  /** The routine tab's daily reminder offer was turned down (or the one after a scan was). */
  routineOfferDismissed: boolean;
  /** The "Do you want daily reminders?" question after a scan was answered Not now. */
  afterScanOfferDismissed: boolean;
  /** When each reminder in the current plan is due (ms), so a day that already had one gets no other. */
  scheduled: number[];
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  weeklyMinute: 0,
  streak: true,
  routine: 'off',
  routineTimes: {
    morning: { ...ROUTINE_REMINDER_START_TIMES.morning },
    evening: { ...ROUTINE_REMINDER_START_TIMES.evening },
  },
  introSeen: false,
  routineVisits: 0,
  routineOfferDismissed: false,
  afterScanOfferDismissed: false,
  scheduled: [],
};

const KEY = 'glowtrack.reminders';

function isSlot(value: unknown): value is RoutineReminderSlot {
  return value === 'off' || value === 'morning' || value === 'evening';
}

const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;

function isWhole(value: unknown, below: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < below;
}

function asRecord(value: unknown): Partial<Record<string, unknown>> {
  return typeof value === 'object' && value !== null ? value : {};
}

function readTime(value: unknown): ReminderTime | null {
  const stored = asRecord(value);
  return isWhole(stored.hour, HOURS_IN_DAY) && isWhole(stored.minute, MINUTES_IN_HOUR)
    ? { hour: stored.hour, minute: stored.minute }
    : null;
}

/**
 * Stored times, each falling back to its starting suggestion if missing or
 * not a real time of day. Builds before minutes could be picked stored a
 * whole hour per routine (`routineHours`); that hour is kept, on the hour.
 */
function readRoutineTimes(times: unknown, legacyHours: unknown): Record<RoutineSlot, ReminderTime> {
  const stored = asRecord(times);
  const hours = asRecord(legacyHours);
  const read = (slot: RoutineSlot): ReminderTime => {
    const time = readTime(stored[slot]);
    if (time) return time;
    const hour = hours[slot];
    if (isWhole(hour, HOURS_IN_DAY)) return { hour, minute: 0 };
    return { ...ROUTINE_REMINDER_START_TIMES[slot] };
  };
  return { morning: read('morning'), evening: read('evening') };
}

export async function readReminderSettings(): Promise<ReminderSettings> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return DEFAULT_REMINDER_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_REMINDER_SETTINGS;
    const stored: Partial<Record<keyof ReminderSettings | 'routineHours', unknown>> = parsed;
    const flag = (value: unknown, fallback: boolean) =>
      typeof value === 'boolean' ? value : fallback;
    return {
      enabled: flag(stored.enabled, DEFAULT_REMINDER_SETTINGS.enabled),
      weeklyMinute: isWhole(stored.weeklyMinute, MINUTES_IN_HOUR)
        ? stored.weeklyMinute
        : DEFAULT_REMINDER_SETTINGS.weeklyMinute,
      streak: flag(stored.streak, DEFAULT_REMINDER_SETTINGS.streak),
      routine: isSlot(stored.routine) ? stored.routine : DEFAULT_REMINDER_SETTINGS.routine,
      routineTimes: readRoutineTimes(stored.routineTimes, stored.routineHours),
      introSeen: flag(stored.introSeen, false),
      routineVisits: typeof stored.routineVisits === 'number' ? stored.routineVisits : 0,
      routineOfferDismissed: flag(stored.routineOfferDismissed, false),
      afterScanOfferDismissed: flag(stored.afterScanOfferDismissed, false),
      scheduled: Array.isArray(stored.scheduled)
        ? stored.scheduled.filter((time): time is number => typeof time === 'number')
        : [],
    };
  } catch (error: unknown) {
    logInDevelopment('Could not read the reminder settings', error);
    return DEFAULT_REMINDER_SETTINGS;
  }
}

export async function writeReminderSettings(settings: ReminderSettings): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(settings));
  } catch (error: unknown) {
    // The settings still apply for this session; only a restart would forget them.
    logInDevelopment('Could not save the reminder settings', error);
  }
}

export async function clearReminderSettings(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch (error: unknown) {
    logInDevelopment('Could not clear the reminder settings', error);
  }
}
