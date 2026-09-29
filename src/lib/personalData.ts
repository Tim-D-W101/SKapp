import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { copy } from '@/constants/copy';
import { SCANS_BUCKET } from '@/constants/scan';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

/**
 * The person's own data: a copy they can keep, and deleting their photos.
 * Row-level security limits every query here to the signed-in user.
 */

const PAGE_SIZE = 1000;
const STORAGE_PAGE_SIZE = 100;

/** Everything the app stores about a person except the photos themselves. */
export interface DataExport {
  format: 'glowtrack-data-export';
  version: 1;
  exportedAt: string;
  appVersion: string | null;
  account: { userId: string; email: string | null };
  profile: Tables<'profiles'> | null;
  scans: Tables<'scans'>[];
  results: Tables<'scan_results'>[];
  routines: Tables<'routines'>[];
  routineLogs: Tables<'routine_logs'>[];
}

type Page<T> = PromiseLike<{ data: T[] | null; error: unknown }>;

/** Every row a query returns, fetched a page at a time. */
async function allRows<T>(page: (from: number, to: number) => Page<T>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) return rows;
  }
}

export async function buildDataExport(userId: string, email: string | null): Promise<DataExport> {
  const [profile, scans, results, routines, routineLogs] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
    allRows((from, to) => supabase.from('scans').select('*').order('created_at').range(from, to)),
    allRows((from, to) =>
      supabase.from('scan_results').select('*').order('created_at').range(from, to),
    ),
    allRows((from, to) =>
      supabase.from('routines').select('*').order('created_at').range(from, to),
    ),
    allRows((from, to) =>
      supabase.from('routine_logs').select('*').order('completed_at').range(from, to),
    ),
  ]);
  return {
    format: 'glowtrack-data-export',
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: Constants.expoConfig?.version ?? null,
    account: { userId, email },
    profile,
    scans,
    results,
    routines,
    routineLogs,
  };
}

/** One file, replaced by each export, in the app's cache: never the photo library. */
function exportFile(): File {
  return new File(Paths.cache, copy.settings.data.exportFileName);
}

/** Writes the export to a file and opens the share sheet, so it can be saved or sent anywhere. */
export async function shareDataExport(data: DataExport): Promise<void> {
  const file = exportFile();
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(data, null, 2));
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: copy.settings.data.download,
    UTI: 'public.json',
  });
}

/** Removes the last export from the phone, if one is there. */
export function deleteDataExportFile(): void {
  const file = exportFile();
  if (file.exists) file.delete();
}

/**
 * Removes every file under the user's folder in the scans bucket. The scores
 * and history stay. Storage reports a refused delete as an empty result, not
 * an error, so that throws rather than loop forever.
 */
export async function removeStoredPhotos(userId: string): Promise<void> {
  const bucket = supabase.storage.from(SCANS_BUCKET);
  for (;;) {
    // Always list from the start: each pass deletes what the previous one found.
    const { data: files, error } = await bucket.list(userId, { limit: STORAGE_PAGE_SIZE });
    if (error) throw error;
    if (files.length === 0) return;

    const { data: removed, error: removeError } = await bucket.remove(
      files.map((file) => `${userId}/${file.name}`),
    );
    if (removeError) throw removeError;
    if (removed.length === 0) throw new Error('Stored photos could not be removed');
    if (files.length < STORAGE_PAGE_SIZE) return;
  }
}
