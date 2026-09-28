import type { copy } from '@/constants/copy';

/**
 * Subscriptions. The products are set up by hand in Play Console and
 * RevenueCat (README > Subscriptions), and these names must match that setup.
 */

/**
 * The RevenueCat entitlement every plan unlocks. The analyze-scan Edge
 * Function checks the same one before it analyses a paid scan.
 */
export const PREMIUM_ENTITLEMENT = 'premium';

/**
 * The plans, in the order the paywall shows them. Each is a package in the
 * current RevenueCat offering ("default"), matched by its package type. A
 * plan missing from the offering is simply not shown.
 */
export const PLAN_IDS = [
  'annual',
  'monthly',
  'weekly',
] as const satisfies readonly (keyof typeof copy.paywall.plans)[];

export type PlanId = (typeof PLAN_IDS)[number];

/** Selected when the paywall opens. */
export const DEFAULT_PLAN: PlanId = 'annual';

/** A year of weekly payments, for the annual plan's saving against the weekly one. */
export const WEEKS_PER_YEAR = 52;

/**
 * Where the paywall was opened from. It decides where "Continue" goes once
 * someone subscribes, and it's recorded with `paywall_viewed`.
 * - scan: a scan attempt after the free scan
 * - progress, compare: the trend and comparisons
 * - subscription_required: the server turned a scan down (402)
 */
export const PAYWALL_TRIGGERS = ['scan', 'progress', 'compare', 'subscription_required'] as const;

export type PaywallTrigger = (typeof PAYWALL_TRIGGERS)[number];

export function parsePaywallTrigger(value: unknown): PaywallTrigger {
  return PAYWALL_TRIGGERS.find((trigger) => trigger === value) ?? 'scan';
}
