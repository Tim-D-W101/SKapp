import type { ShareFormat } from '@/constants/share';
import type { PaywallTrigger, PlanId } from '@/constants/subscription';

/** Why a purchase didn't go through, other than being cancelled. */
export type PurchaseFailureReason =
  'payment_pending' | 'already_subscribed' | 'store_unavailable' | 'network' | 'unknown';

/**
 * Every analytics event and its properties. A typo in an event name is a
 * compile error, not a silently missing event.
 *
 * Properties are scores, counts and choices only: never the photo, a storage
 * path, a signed URL, an email address or any text from a scan.
 */
export interface AnalyticsEvents {
  share_initiated: { surface: 'results' | 'compare'; format: ShareFormat };
  paywall_viewed: { trigger: PaywallTrigger };
  plan_selected: { plan_id: PlanId };
  purchase_started: { plan_id: PlanId };
  purchase_completed: { plan_id: PlanId; price: number; currency: string; is_trial: boolean };
  purchase_failed: { plan_id: PlanId; reason: PurchaseFailureReason };
  purchase_cancelled: { plan_id: PlanId };
}

export type EventName = keyof AnalyticsEvents;

/**
 * Records an event. A stand-in until PostHog is added in Phase 11: for now it
 * only logs in development, and nothing leaves the phone.
 */
export function track<E extends EventName>(event: E, properties: AnalyticsEvents[E]): void {
  if (__DEV__) {
    console.info(`[analytics] ${event}`, properties);
  }
}
