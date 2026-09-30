import { Platform } from 'react-native';
import Purchases, {
  PERIOD_UNIT,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesStoreProduct,
} from 'react-native-purchases';

import {
  PLAN_IDS,
  PREMIUM_ENTITLEMENT,
  WEEKS_PER_YEAR,
  type PlanId,
} from '@/constants/subscription';
import { logInDevelopment } from '@/lib/errors';

/**
 * The app's side of subscriptions: a thin wrapper over RevenueCat's SDK.
 *
 * RevenueCat's app user id is the Supabase user id. A subscription belongs to
 * the account, so it survives a reinstall along with the account, and the
 * analyze-scan Edge Function can check the same user's entitlement.
 */

/**
 * What RevenueCat says about the premium entitlement.
 * - unknown: not heard yet, or subscriptions don't work on this phone
 * - active: subscribed now, including a free trial
 * - lapsed: subscribed before, not now
 * - none: never subscribed
 */
export type EntitlementStatus = 'unknown' | 'active' | 'lapsed' | 'none';

export type TrialUnit = 'day' | 'week' | 'month' | 'year';

export interface FreeTrial {
  count: number;
  unit: TrialUnit;
}

/** One plan on the paywall. */
export interface Plan {
  id: PlanId;
  /** What the purchase call needs. */
  pkg: PurchasesPackage;
  /** The amount billed each period, formatted by the store in the local currency. */
  priceString: string;
  price: number;
  currencyCode: string;
  /** The free trial buying this plan would start, if this person can have one. */
  trial: FreeTrial | null;
}

export type PurchaseOutcome =
  /** Bought, and the entitlement is active. */
  | { kind: 'purchased'; info: CustomerInfo }
  /** Bought, but the entitlement isn't active yet. */
  | { kind: 'unconfirmed'; info: CustomerInfo }
  | { kind: 'cancelled' }
  /** Waiting on a slow payment method. Google Play finishes it later. */
  | { kind: 'pending' }
  | { kind: 'alreadySubscribed' }
  | { kind: 'storeUnavailable' }
  | { kind: 'network' }
  | { kind: 'failed' };

export type RestoreOutcome =
  | { kind: 'restored'; info: CustomerInfo }
  | { kind: 'nothingToRestore'; info: CustomerInfo }
  /** The store account's subscription is tied to a different app user. */
  | { kind: 'inUseElsewhere' }
  | { kind: 'failed' };

/** RevenueCat's public SDK key for the store this build runs on: goog_… or appl_…. */
const API_KEY = Platform.select({
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
});

/** The user RevenueCat was last pointed at. Null until the SDK is configured. */
let currentUserId: string | null = null;

export function isPurchasesConfigured(): boolean {
  return currentUserId !== null;
}

/**
 * Points RevenueCat at the signed-in user: configures the SDK the first time,
 * and switches user after that. Resolves with that user's customer info.
 * Throws if subscriptions can't work here (no key for this platform, or no
 * native module, as in Expo Go without a development build).
 */
export async function identifyUser(userId: string): Promise<CustomerInfo> {
  if (!API_KEY) throw new Error('No RevenueCat key for this platform');
  if (currentUserId === null) {
    Purchases.configure({ apiKey: API_KEY, appUserID: userId });
    currentUserId = userId;
    return Purchases.getCustomerInfo();
  }
  if (currentUserId !== userId) {
    const { customerInfo } = await Purchases.logIn(userId);
    currentUserId = userId;
    return customerInfo;
  }
  return Purchases.getCustomerInfo();
}

export function fetchCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

/**
 * Calls `listener` whenever RevenueCat's view of the customer changes, for
 * example when a renewal or a pending payment goes through.
 */
export function onCustomerInfoChange(listener: (info: CustomerInfo) => void): void {
  Purchases.addCustomerInfoUpdateListener(listener);
}

export function entitlementStatus(info: CustomerInfo): EntitlementStatus {
  if (PREMIUM_ENTITLEMENT in info.entitlements.active) return 'active';
  return PREMIUM_ENTITLEMENT in info.entitlements.all ? 'lapsed' : 'none';
}

/** The subscription as Settings describes it. */
export interface SubscriptionDetails {
  /** Null for a product that isn't one of the paywall's plans. */
  planId: PlanId | null;
  /** When it renews, ends or (in a free trial) the trial ends, as an ISO timestamp. Null if never. */
  expiresAt: string | null;
  willRenew: boolean;
  isTrial: boolean;
  /** Where the store manages it, when RevenueCat knows. */
  managementUrl: string | null;
}

function isPlanId(value: string): value is PlanId {
  return (PLAN_IDS as readonly string[]).includes(value);
}

/** The premium subscription in effect now, or null without one. */
export function subscriptionDetails(info: CustomerInfo): SubscriptionDetails | null {
  const entitlement = info.entitlements.active[PREMIUM_ENTITLEMENT];
  if (!entitlement) return null;
  // On Google Play the base plan (weekly, monthly, annual) is the plan; the
  // product id carries it after a colon too, as "glowtrack_premium:annual".
  const basePlan =
    entitlement.productPlanIdentifier ?? entitlement.productIdentifier.split(':')[1] ?? '';
  return {
    planId: isPlanId(basePlan) ? basePlan : null,
    expiresAt: entitlement.expirationDate,
    willRenew: entitlement.willRenew,
    isTrial: entitlement.periodType === 'TRIAL',
    managementUrl: info.managementURL,
  };
}

/** The plans in the current offering, in display order. Empty if it has none of ours. */
export async function fetchPlans(): Promise<Plan[]> {
  const offerings = await Purchases.getOfferings();
  const offering = offerings.current;
  if (!offering) return [];
  return PLAN_IDS.flatMap((id) => {
    const pkg = offering[id];
    return pkg ? [toPlan(id, pkg)] : [];
  });
}

function toPlan(id: PlanId, pkg: PurchasesPackage): Plan {
  const { product } = pkg;
  return {
    id,
    pkg,
    priceString: product.priceString,
    price: product.price,
    currencyCode: product.currencyCode,
    trial: freeTrial(product),
  };
}

const TRIAL_UNITS: Partial<Record<PERIOD_UNIT, TrialUnit>> = {
  [PERIOD_UNIT.DAY]: 'day',
  [PERIOD_UNIT.WEEK]: 'week',
  [PERIOD_UNIT.MONTH]: 'month',
  [PERIOD_UNIT.YEAR]: 'year',
};

/**
 * The free trial a purchase would start. On Google Play, the default option
 * is what `purchasePackage` buys, and Play only lists offers this person is
 * eligible for, so a trial shown here is one they will get. (The App Store
 * lists introductory offers whether or not someone can have them, so iOS
 * will need an eligibility check before it shows a trial.)
 */
function freeTrial(product: PurchasesStoreProduct): FreeTrial | null {
  const period = product.defaultOption?.freePhase?.billingPeriod;
  if (!period || period.value <= 0) return null;
  const unit = TRIAL_UNITS[period.unit];
  return unit ? { count: period.value, unit } : null;
}

/**
 * How much the annual plan saves against a year of weekly payments, as a
 * whole percentage. Rounded down, so the saving is never overstated. Null
 * when either plan is missing or there is no saving.
 */
export function annualSaving(plans: readonly Plan[]): number | null {
  const weekly = plans.find((plan) => plan.id === 'weekly');
  const annual = plans.find((plan) => plan.id === 'annual');
  if (!weekly || !annual || weekly.currencyCode !== annual.currencyCode || weekly.price <= 0) {
    return null;
  }
  const fraction = 1 - annual.price / (weekly.price * WEEKS_PER_YEAR);
  // The small allowance stops float error turning an exact 50% into 49%.
  const percent = Math.floor(fraction * 100 + 1e-9);
  return percent > 0 ? percent : null;
}

/** When a trial started at `start` ends, which is when the first payment is taken. */
export function trialEndDate(trial: FreeTrial, start: Date = new Date()): Date {
  const end = new Date(start);
  switch (trial.unit) {
    case 'day':
      end.setDate(end.getDate() + trial.count);
      break;
    case 'week':
      end.setDate(end.getDate() + trial.count * 7);
      break;
    case 'month':
      end.setMonth(end.getMonth() + trial.count);
      break;
    case 'year':
      end.setFullYear(end.getFullYear() + trial.count);
      break;
  }
  return end;
}

/** Starts the store's purchase sheet for the plan, and reports how it ended. */
export async function purchasePlan(plan: Plan): Promise<PurchaseOutcome> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(plan.pkg);
    return entitlementStatus(customerInfo) === 'active'
      ? { kind: 'purchased', info: customerInfo }
      : { kind: 'unconfirmed', info: customerInfo };
  } catch (error: unknown) {
    logInDevelopment('Purchase did not complete', error);
    return { kind: purchaseFailureKind(error) };
  }
}

/** Looks for a subscription on the phone's store account and moves it to this user. */
export async function restorePurchases(): Promise<RestoreOutcome> {
  try {
    const info = await Purchases.restorePurchases();
    return entitlementStatus(info) === 'active'
      ? { kind: 'restored', info }
      : { kind: 'nothingToRestore', info };
  } catch (error: unknown) {
    logInDevelopment('Restore did not complete', error);
    const code = errorCode(error);
    return {
      kind:
        code === PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR ||
        code === PURCHASES_ERROR_CODE.RECEIPT_IN_USE_BY_OTHER_SUBSCRIBER_ERROR
          ? 'inUseElsewhere'
          : 'failed',
    };
  }
}

type FailureKind = Exclude<PurchaseOutcome['kind'], 'purchased' | 'unconfirmed'>;

function purchaseFailureKind(error: unknown): FailureKind {
  switch (errorCode(error)) {
    case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
      return 'cancelled';
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return 'pending';
    case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
    case PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR:
    case PURCHASES_ERROR_CODE.RECEIPT_IN_USE_BY_OTHER_SUBSCRIBER_ERROR:
      return 'alreadySubscribed';
    case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
    case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
    case PURCHASES_ERROR_CODE.CONFIGURATION_ERROR:
    case PURCHASES_ERROR_CODE.UNSUPPORTED_ERROR:
      return 'storeUnavailable';
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
    case PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR:
    case PURCHASES_ERROR_CODE.API_ENDPOINT_BLOCKED:
      return 'network';
    default:
      // Older bridges flag a cancellation without the code.
      return isUserCancelled(error) ? 'cancelled' : 'failed';
  }
}

/** True when a failure is about the connection, not the store or the account. */
export function isPurchasesNetworkError(error: unknown): boolean {
  const code = errorCode(error);
  return (
    code === PURCHASES_ERROR_CODE.NETWORK_ERROR ||
    code === PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR
  );
}

const ERROR_CODES = new Set<string>(Object.values(PURCHASES_ERROR_CODE));

function isErrorCode(value: string): value is PURCHASES_ERROR_CODE {
  return ERROR_CODES.has(value);
}

function errorCode(error: unknown): PURCHASES_ERROR_CODE | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) return null;
  const { code } = error;
  return typeof code === 'string' && isErrorCode(code) ? code : null;
}

function isUserCancelled(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'userCancelled' in error &&
    error.userCancelled === true
  );
}
