import { File, Paths } from 'expo-file-system';

import { REMINDER_ATTRIBUTION_MS } from '@/constants/analytics';
import { setPersonProperties } from '@/lib/analytics';
import { calendarDaysBetween } from '@/lib/dates';
import { logInDevelopment } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

/**
 * What some analytics events need that the rest of the app doesn't keep:
 * when the app was first opened on this phone, how many scans the person has
 * completed, and whether a reminder just brought them back.
 */

// ---------------------------------------------------------------------------
// First open

export interface InstallInfo {
  /** True only on the launch that recorded the first open. */
  isFirstOpen: boolean;
}

const INSTALL_FILE = 'install.json';

let installLoad: Promise<InstallInfo> | null = null;
/** When the app was first opened on this phone, as an ISO timestamp. */
let firstOpenedAt: string | null = null;

function readFirstOpen(file: File): string | null {
  if (!file.exists) return null;
  const parsed: unknown = JSON.parse(file.textSync());
  if (typeof parsed !== 'object' || parsed === null || !('firstOpenedAt' in parsed)) return null;
  const { firstOpenedAt: stored } = parsed;
  return typeof stored === 'string' && !Number.isNaN(Date.parse(stored)) ? stored : null;
}

/**
 * Reads when the app was first opened, recording now on the very first
 * launch. Kept in a file in the app's private storage, so reinstalling
 * starts over. Never rejects.
 */
export function loadInstallInfo(): Promise<InstallInfo> {
  installLoad ??= (async () => {
    const file = new File(Paths.document, INSTALL_FILE);
    try {
      const stored = readFirstOpen(file);
      if (stored) {
        firstOpenedAt = stored;
        return { isFirstOpen: false };
      }
    } catch (error: unknown) {
      logInDevelopment('Could not read the first-open date', error);
    }
    firstOpenedAt = new Date().toISOString();
    try {
      if (!file.exists) file.create();
      file.write(JSON.stringify({ firstOpenedAt }));
    } catch (error: unknown) {
      // Only analytics suffer: the next launch counts as a first open again.
      logInDevelopment('Could not save the first-open date', error);
    }
    return { isFirstOpen: true };
  })();
  return installLoad;
}

/** Whole days since the first open, or null before loadInstallInfo has finished. */
export function daysSinceInstall(now: Date = new Date()): number | null {
  return firstOpenedAt === null ? null : calendarDaysBetween(firstOpenedAt, now.toISOString());
}

// ---------------------------------------------------------------------------
// Completed scans

interface ScanStats {
  count: number;
  /** When the latest completed scan was taken. */
  lastCompletedAt: string | null;
}

/** The user the stats belong to. A request for anyone else is dropped. */
let statsUserId: string | null = null;
let stats: ScanStats | null = null;

/**
 * Counts the signed-in user's completed scans. Call when the user changes;
 * the count then follows each scan that completes on this phone.
 */
export async function refreshScanStats(userId: string): Promise<void> {
  if (statsUserId !== userId) {
    statsUserId = userId;
    stats = null;
  }
  try {
    // Row-level security limits this to the signed-in user's own scans.
    const { data, count, error } = await supabase
      .from('scan_results')
      .select('created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    if (statsUserId !== userId || count === null) return;
    stats = { count, lastCompletedAt: data[0]?.created_at ?? null };
    setPersonProperties({ scan_count: count });
  } catch (error: unknown) {
    // Scan numbers are sent as unknown until the next refresh.
    logInDevelopment('Could not count completed scans', error);
  }
}

/** How many scans the person has completed, or null if not known. */
export function completedScanCount(): number | null {
  return stats?.count ?? null;
}

/** The number the next scan will have, or null if not known. */
export function nextScanNumber(): number | null {
  return stats === null ? null : stats.count + 1;
}

/** Whole days since the latest completed scan, or null for none or not known. */
export function daysSinceLastScan(now: Date = new Date()): number | null {
  const last = stats?.lastCompletedAt;
  return last ? calendarDaysBetween(last, now.toISOString()) : null;
}

/** Counts a scan that has just completed, and returns its number (null if not known). */
export function noteCompletedScan(createdAt: string): number | null {
  if (stats === null) {
    // Counted from the server instead, which includes this scan.
    if (statsUserId) void refreshScanStats(statsUserId);
    return null;
  }
  stats = { count: stats.count + 1, lastCompletedAt: createdAt };
  setPersonProperties({ scan_count: stats.count });
  return stats.count;
}

// ---------------------------------------------------------------------------
// Reminders

let rescanReminderOpenedAt: number | null = null;

/** Someone opened the app from a re-scan or streak reminder. */
export function noteRescanReminderOpened(now: number = Date.now()): void {
  rescanReminderOpenedAt = now;
}

/** True, once, when a re-scan reminder was opened recently: the scan starting now is credited to it. */
export function takeRescanReminder(now: number = Date.now()): boolean {
  const openedAt = rescanReminderOpenedAt;
  rescanReminderOpenedAt = null;
  return openedAt !== null && now - openedAt <= REMINDER_ATTRIBUTION_MS;
}
