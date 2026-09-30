/**
 * Whether a user has an active subscription, asked of RevenueCat's REST API
 * with the secret key. The app's own view is never trusted here: a modified
 * app could claim anything, and each paid scan costs a model call.
 */
import { z } from 'zod';

/** The entitlement every plan unlocks. Must match `PREMIUM_ENTITLEMENT` in src/constants/subscription.ts. */
export const PREMIUM_ENTITLEMENT = 'premium';

const SUBSCRIBERS_URL = 'https://api.revenuecat.com/v1/subscribers/';
const REQUEST_TIMEOUT_MS = 8_000;

/** How long an active entitlement is trusted without asking again. */
export const CACHE_TTL_MS = 5 * 60 * 1000;
/** A cap on remembered users, so a long-lived instance's cache can't grow without limit. */
const MAX_CACHED_USERS = 1_000;

const subscriberSchema = z.object({
  subscriber: z.object({
    entitlements: z.record(z.string(), z.unknown()),
  }),
});

const entitlementSchema = z.object({
  /** Null for an entitlement that never expires. */
  expires_date: z.string().nullable(),
  grace_period_expires_date: z.string().nullable().optional(),
});

/** RevenueCat couldn't be asked, or answered with something unexpected. Not a "no". */
export class EntitlementCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EntitlementCheckError';
  }
}

/**
 * User id -> until when their active entitlement is trusted. Only an active
 * entitlement is remembered: remembering a "no" would keep refusing someone
 * for minutes after they subscribe. Held per function instance, so it saves
 * calls while an instance stays warm and is simply empty after a cold start.
 */
const trustedUntil = new Map<string, number>();

/** When the entitlement ends, in ms since the epoch, or Infinity if it never does. */
function endsAt(raw: unknown): number {
  const parsed = entitlementSchema.safeParse(raw);
  if (!parsed.success) throw new EntitlementCheckError('Unexpected entitlement shape');
  const { expires_date: expires, grace_period_expires_date: grace } = parsed.data;
  if (expires === null) return Number.POSITIVE_INFINITY;
  // A billing grace period keeps the subscription going while payment is retried.
  const ends = Math.max(Date.parse(expires), grace ? Date.parse(grace) : Number.NEGATIVE_INFINITY);
  if (Number.isNaN(ends)) throw new EntitlementCheckError('Unreadable entitlement expiry');
  return ends;
}

function remember(userId: string, until: number): void {
  if (trustedUntil.size >= MAX_CACHED_USERS) {
    // Maps keep insertion order: drop the entry remembered longest ago.
    const oldest = trustedUntil.keys().next();
    if (!oldest.done) trustedUntil.delete(oldest.value);
  }
  trustedUntil.set(userId, until);
}

/**
 * True when the user's premium entitlement is active now. An active answer
 * is remembered for five minutes, or until the entitlement ends if that's
 * sooner. Throws EntitlementCheckError when RevenueCat can't give an answer,
 * so a failure is never mistaken for "not subscribed".
 */
export async function hasActiveEntitlement(
  userId: string,
  secretKey: string,
  now: number = Date.now(),
): Promise<boolean> {
  const trusted = trustedUntil.get(userId);
  if (trusted !== undefined) {
    if (trusted > now) return true;
    trustedUntil.delete(userId);
  }

  let response: Response;
  try {
    response = await fetch(SUBSCRIBERS_URL + encodeURIComponent(userId), {
      headers: { authorization: `Bearer ${secretKey}`, accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new EntitlementCheckError(`RevenueCat unreachable: ${reason}`);
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw new EntitlementCheckError(`RevenueCat answered HTTP ${response.status}`);
  }

  const body: unknown = await response.json().catch(() => null);
  const parsed = subscriberSchema.safeParse(body);
  if (!parsed.success) throw new EntitlementCheckError('Unexpected RevenueCat response');

  const entitlement = parsed.data.subscriber.entitlements[PREMIUM_ENTITLEMENT];
  if (entitlement === undefined) return false;
  const ends = endsAt(entitlement);
  if (ends <= now) return false;
  remember(userId, Math.min(now + CACHE_TTL_MS, ends));
  return true;
}
