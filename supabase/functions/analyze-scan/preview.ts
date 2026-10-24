/**
 * The preview scan key: lets a preview test build run real scans after the
 * free one without a subscription, so testers can try the app before the
 * Play subscriptions exist.
 *
 * Off unless the `PREVIEW_BYPASS_TOKEN` Edge Function secret is set. When it
 * is, a request whose `x-preview-bypass-token` header carries the same value
 * counts as subscribed for the access check, and nothing else changes: the
 * free scan still comes first and is still used up by the first finished
 * scan, and the sign-in, ownership and pending-only checks still apply. The
 * key itself is never logged.
 *
 * Only a preview build ever sends the header: the app adds it only in a
 * build that offers the Preview premium switch (never one on the production
 * channel), while that switch is on, and only if the build was published
 * with `EXPO_PUBLIC_PREVIEW_BYPASS_TOKEN`, which exists in the EAS `preview`
 * environment only. The key is inside every preview update, so anyone with
 * the preview build could find it: keep preview builds private, change the
 * key in both places if one leaks, and unset the secret to switch it off.
 * See docs/ota-updates.md, "Testing premium on the preview build".
 *
 * No Deno APIs, so it also loads in plain Node.
 */
import { createHash, timingSafeEqual } from 'node:crypto';

/** The request header the preview build sends the key in. Must match `PREVIEW_BYPASS_HEADER` in src/lib/premiumPreview.ts. */
export const PREVIEW_BYPASS_HEADER = 'x-preview-bypass-token';

/** The Edge Function secret holding the key. */
export const PREVIEW_BYPASS_SECRET = 'PREVIEW_BYPASS_TOKEN';

/** The shortest key honoured, so a short, guessable one can't open scans. `openssl rand -hex 32` gives 64. */
export const MIN_PREVIEW_TOKEN_LENGTH = 32;

/**
 * The key to honour, from the secret's value: null when it's unset, or too
 * short to be safe (that one is ignored, and the reason returned for the log).
 */
export function readPreviewToken(value: string | undefined): {
  token: string | null;
  problem: string | null;
} {
  const token = value?.trim() ?? '';
  if (token === '') return { token: null, problem: null };
  if (token.length < MIN_PREVIEW_TOKEN_LENGTH) {
    return {
      token: null,
      problem: `${PREVIEW_BYPASS_SECRET} is shorter than ${MIN_PREVIEW_TOKEN_LENGTH} characters, so it is ignored`,
    };
  }
  return { token, problem: null };
}

function digest(value: string): Uint8Array {
  return createHash('sha256').update(value, 'utf8').digest();
}

/**
 * What the request's preview key, if any, comes to:
 * - `absent`: no key sent, as from every production build
 * - `accepted`: the key matches the secret, so the scan counts as subscribed
 * - `rejected`: a key that doesn't match
 * - `off`: a key was sent, but no secret is set, so none is honoured
 *
 * Compared in constant time, on digests of equal length, so the time taken
 * says nothing about how much of a guess was right.
 */
export type PreviewTokenStatus = 'absent' | 'accepted' | 'rejected' | 'off';

export function previewTokenStatus(request: Request, token: string | null): PreviewTokenStatus {
  const sent = request.headers.get(PREVIEW_BYPASS_HEADER)?.trim();
  if (!sent) return 'absent';
  if (token === null) return 'off';
  return timingSafeEqual(digest(sent), digest(token)) ? 'accepted' : 'rejected';
}
