import type { User } from '@supabase/supabase-js';

import { logInDevelopment } from '@/lib/errors';
import { secureChunkedStorage } from '@/lib/supabase';
import type { Profile } from '@/types/profile';

/**
 * The user and profile the server last confirmed, kept encrypted on the phone
 * next to the session. It lets a returning user open the app with no
 * connection. Launch swaps it for the server's answer as soon as there is one.
 */
export interface CachedAccount {
  user: User;
  profile: Profile;
}

const STORAGE_KEY = 'glowtrack.account';

/** Raised when the stored shape changes, so a copy from an older version is dropped, not misread. */
const VERSION = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUser(value: unknown): value is User {
  return isRecord(value) && typeof value.id === 'string';
}

function isProfile(value: unknown): value is Profile {
  return (
    isRecord(value) && typeof value.id === 'string' && typeof value.free_scan_used === 'boolean'
  );
}

// Writes and removals run one at a time: the chunked storage isn't atomic,
// so two overlapping writes could interleave their chunks.
let queue: Promise<void> = Promise.resolve();

function enqueue(work: () => Promise<void>): Promise<void> {
  queue = queue.then(work, work);
  return queue;
}

/** The saved copy, or null if there is none or it can't be read. */
export async function readCachedAccount(): Promise<CachedAccount | null> {
  try {
    await queue;
    const stored = await secureChunkedStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed) || parsed.version !== VERSION) return null;
    const { user, profile } = parsed;
    if (!isUser(user) || !isProfile(profile) || profile.id !== user.id) return null;
    return { user, profile };
  } catch (error: unknown) {
    // A damaged copy is dropped: the next launch with a connection writes a new one.
    logInDevelopment('Could not read the saved account', error);
    return null;
  }
}

export function writeCachedAccount(account: CachedAccount): Promise<void> {
  return enqueue(async () => {
    try {
      await secureChunkedStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: VERSION, ...account }),
      );
    } catch (error: unknown) {
      // Only an offline start needs it, and that then shows the usual retry.
      logInDevelopment('Could not save the account on the phone', error);
    }
  });
}

/** Removes the copy, when the user signs out or deletes their account. */
export function clearCachedAccount(): Promise<void> {
  return enqueue(async () => {
    try {
      await secureChunkedStorage.removeItem(STORAGE_KEY);
    } catch (error: unknown) {
      logInDevelopment('Could not clear the saved account', error);
    }
  });
}
