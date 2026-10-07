import PostHog from 'posthog-react-native';

import type { ShareFormat } from '@/constants/share';
import type { PaywallTrigger, PlanId } from '@/constants/subscription';
import type { OnboardingStep } from '@/lib/onboarding';
import type { RoutineSlot } from '@/types/routine';
import type { CameraFacing } from '@/types/scan';

/** Why a purchase didn't go through, other than being cancelled. */
export type PurchaseFailureReason =
  'payment_pending' | 'already_subscribed' | 'store_unavailable' | 'network' | 'unknown';

/**
 * Every analytics event and its properties. A typo in an event name is a
 * compile error, not a silently missing event.
 *
 * Properties are scores, counts and choices only: never the photo, a storage
 * path, a signed URL, an email address, the headline or the observation text.
 *
 * `scan_number` is which scan this is for the person: the next one for
 * camera, submit and reject events, the scan itself once it completes, and
 * the number completed so far on the paywall. Null when it isn't known yet
 * (offline at launch).
 */
export interface AnalyticsEvents {
  app_opened: { is_first_open: boolean; days_since_install: number | null };
  onboarding_started: Record<string, never>;
  onboarding_step: { step_name: OnboardingStep; step_index: number };
  onboarding_completed: {
    skin_type: string | null;
    age_band: string | null;
    concern_count: number;
  };
  camera_opened: { scan_number: number | null };
  /** A press of the shutter, including one while the checks still hold it back. */
  capture_attempted: {
    brightness_ok: boolean;
    /** Always null: the app has no face detection, only the oval guide. */
    face_ok: null;
    stability_ok: boolean;
  };
  scan_submitted: {
    scan_number: number | null;
    capture_quality: { brightness: number | null; motion: number | null; facing: CameraFacing };
  };
  scan_completed: { scan_number: number | null; overall_score: number; seconds_elapsed: number };
  scan_rejected: { reject_reason: string; scan_number: number | null };
  scan_failed: { error_code: string };
  results_viewed: { scan_number: number | null; overall_score: number };
  share_initiated: { surface: 'results' | 'compare'; format: ShareFormat };
  paywall_viewed: { trigger: PaywallTrigger; scan_number: number | null };
  plan_selected: { plan_id: PlanId };
  purchase_started: { plan_id: PlanId };
  purchase_completed: { plan_id: PlanId; price: number; currency: string; is_trial: boolean };
  purchase_failed: { plan_id: PlanId; reason: PurchaseFailureReason };
  purchase_cancelled: { plan_id: PlanId };
  /** Ticks only; unticking isn't recorded. `day_number` is 1 on the day the routine was made. */
  routine_step_ticked: { slot: RoutineSlot; step_key: string; day_number: number };
  progress_viewed: { scan_count: number };
  comparison_viewed: { days_between: number };
  /** A scan started soon after tapping a re-scan or streak reminder. */
  rescan_from_reminder: { days_since_last: number | null };
  /** The answer to the system prompt. Not sent when the prompt wasn't shown. */
  notification_permission: { granted: boolean };
}

export type EventName = keyof AnalyticsEvents;

/** What PostHog knows about a person, besides their Supabase user id. Counts and choices only. */
export type PersonProperties = {
  skin_type: string | null;
  age_band: string | null;
  concern_count: number;
  is_premium: boolean;
  scan_count: number;
  days_since_install: number;
};

const PERSON_KEYS = [
  'skin_type',
  'age_band',
  'concern_count',
  'is_premium',
  'scan_count',
  'days_since_install',
] as const satisfies readonly (keyof PersonProperties)[];

const API_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
/** The project's region, such as https://eu.i.posthog.com. A key only works with its own region. */
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST;

/** Undefined until first used; null when analytics isn't configured. */
let client: PostHog | null | undefined;

function posthog(): PostHog | null {
  if (client !== undefined) return client;
  client =
    API_KEY && HOST
      ? new PostHog(API_KEY, {
          host: HOST,
          // Only the events above are sent. Nothing is captured automatically:
          // no lifecycle events, no screens or touches, no session recording,
          // no exceptions (Sentry has those), and no settings pulled from the
          // server that could switch any of it on.
          captureAppLifecycleEvents: false,
          enableSessionReplay: false,
          errorTracking: { autocapture: false },
          disableRemoteConfig: true,
          disableSurveys: true,
          preloadFeatureFlags: false,
        })
      : null;
  return client;
}

/** Records an event. In development it's also logged; nothing is sent without a PostHog key and host. */
export function track<E extends EventName>(event: E, properties: AnalyticsEvents[E]): void {
  if (__DEV__) {
    console.info(`[analytics] ${event}`, properties);
  }
  posthog()?.capture(event, properties);
}

/**
 * Ties this phone's events to the Supabase user id. Events recorded before
 * the first identify (the very first launch) join the same person.
 */
export function identifyUser(userId: string): void {
  posthog()?.identify(userId);
}

let sentProperties: Partial<PersonProperties> = {};

/**
 * Starts afresh for a different user (sign-out, account deletion, signing in
 * to another account), so two people's events are never merged.
 */
export function resetAnalytics(): void {
  sentProperties = {};
  posthog()?.reset();
}

/** Updates the person's properties, sending only the ones that changed. */
export function setPersonProperties(properties: Partial<PersonProperties>): void {
  const changed: Partial<PersonProperties> = {};
  for (const key of PERSON_KEYS) {
    const value = properties[key];
    if (value === undefined || value === sentProperties[key]) continue;
    Object.assign(changed, { [key]: value });
  }
  if (Object.keys(changed).length === 0) return;
  sentProperties = { ...sentProperties, ...changed };
  if (__DEV__) {
    console.info('[analytics] person', changed);
  }
  posthog()?.setPersonProperties(changed, undefined, false);
}
