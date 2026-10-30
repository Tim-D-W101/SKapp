import { copy } from '@/constants/copy';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Whole calendar days from `from` to `to` in the phone's time zone, so a scan
 * last night and one this morning are a day apart. Never negative.
 */
export function calendarDaysBetween(from: string, to: string): number {
  const days = (startOfLocalDay(new Date(to)) - startOfLocalDay(new Date(from))) / MS_PER_DAY;
  // Rounding absorbs the hour a daylight-saving change adds or removes.
  return Math.max(0, Math.round(days));
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * The calendar day in the phone's time zone, as YYYY-MM-DD. A routine day
 * runs from local midnight to local midnight, whatever the UTC date is.
 */
export function localDayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Milliseconds from `now` until the next local midnight. */
export function msUntilLocalMidnight(now: Date = new Date()): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return midnight.getTime() - now.getTime();
}

/** A date the way the phone's language writes it, such as "25 Sept 2026". */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** A day and month without the year, such as "27 Oct", for a recent date where the year goes without saying. */
export function formatDayMonth(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** Today in full, the way the phone's language writes it, such as "Thursday 30 October". */
export function formatLongDay(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

export type PartOfDay = 'morning' | 'afternoon' | 'evening';

/** Where Home's greeting turns: morning from 4 AM, afternoon from noon, evening from 6 PM. */
const GREETING_MORNING_FROM_HOUR = 4;
const GREETING_AFTERNOON_FROM_HOUR = 12;
const GREETING_EVENING_FROM_HOUR = 18;

/** Which greeting fits the time: the small hours still count as the evening before. */
export function partOfDay(date: Date = new Date()): PartOfDay {
  const hour = date.getHours();
  if (hour < GREETING_MORNING_FROM_HOUR || hour >= GREETING_EVENING_FROM_HOUR) return 'evening';
  return hour < GREETING_AFTERNOON_FROM_HOUR ? 'morning' : 'afternoon';
}

let twentyFourHour: boolean | null = null;

/**
 * Whether the phone's language tells time on a 24-hour clock ("19:00")
 * rather than a 12-hour one ("7:00 PM"). Worked out once: only the clock
 * style is taken from the phone, never its wording.
 */
export function usesTwentyFourHourClock(): boolean {
  if (twentyFourHour === null) {
    const onePm = new Date(2000, 0, 1, 13).toLocaleTimeString(undefined, { hour: 'numeric' });
    twentyFourHour = onePm.includes('13');
  }
  return twentyFourHour;
}

/**
 * A time of day, written the same clean way everywhere: "7:45 PM", or
 * "19:45" on a phone that uses a 24-hour clock. Never seconds, odd spacing
 * or a lower-case "pm", whatever the phone's own formatter would add.
 */
export function formatTime(hour: number, minute = 0): string {
  return copy.time.clock(hour, minute, usesTwentyFourHourClock());
}
