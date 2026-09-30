import * as Sentry from '@sentry/react-native';

/**
 * Crash reporting with Sentry, in production builds only.
 *
 * Nothing that could identify a person or show their face leaves the phone
 * with a report: no screenshots or view hierarchy, no request bodies, no IP
 * address, and web addresses, storage paths and email addresses are removed
 * from every message and breadcrumb. The only identifier is the Supabase
 * user id, so crashes can be counted per person.
 */

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

let enabled = false;

const URL_PATTERN = /\bhttps?:\/\/[^\s"'<>]+/gi;
const FILE_URI_PATTERN = /\bfile:\/\/[^\s"'<>]+/gi;
const EMAIL_PATTERN = /[^\s@"'<>/:]+@[^\s@"'<>/]+\.[a-z]{2,}/gi;
/** A scan photo's storage path: the user id, then the scan id. */
const PHOTO_PATH_PATTERN =
  /[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\.jpe?g/gi;
const STORAGE_OBJECT_PATH =
  /(\/storage\/v1\/object\/(?:(?:sign|public|authenticated)\/)?[^/?#]+)\/[^?#]*/i;
/** Breadcrumb data that could hold a request or response body. */
const BODY_KEY_PATTERN = /body|payload|data|input/i;

/**
 * A web address without its query string or fragment (signed links carry a
 * token there, and database queries filter by user id there), and with
 * storage object paths cut back to the bucket.
 */
function scrubUrl(url: string): string {
  const withoutQuery = url.split(/[?#]/, 1)[0] ?? '';
  return withoutQuery.replace(STORAGE_OBJECT_PATH, '$1/[path]');
}

/** Removes web addresses' private parts, local file paths, photo paths and email addresses. */
export function scrubText(text: string): string {
  return text
    .replace(URL_PATTERN, scrubUrl)
    .replace(FILE_URI_PATTERN, 'file://[path]')
    .replace(PHOTO_PATH_PATTERN, '[photo]')
    .replace(EMAIL_PATTERN, '[email]');
}

/** Deep enough for breadcrumb data such as console arguments. */
const MAX_SCRUB_DEPTH = 4;

function scrubValue(value: unknown, depth: number): unknown {
  if (typeof value === 'string') return scrubText(value);
  if (typeof value !== 'object' || value === null) return value;
  if (depth >= MAX_SCRUB_DEPTH) return '[object]';
  if (Array.isArray(value)) return value.map((item) => scrubValue(item, depth + 1));
  const scrubbed: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!BODY_KEY_PATTERN.test(key)) scrubbed[key] = scrubValue(item, depth + 1);
  }
  return scrubbed;
}

function scrubData(data: Record<string, unknown>): Record<string, unknown> {
  const scrubbed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!BODY_KEY_PATTERN.test(key)) scrubbed[key] = scrubValue(value, 1);
  }
  return scrubbed;
}

export function scrubBreadcrumb(breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb {
  return {
    ...breadcrumb,
    message: breadcrumb.message === undefined ? undefined : scrubText(breadcrumb.message),
    data: breadcrumb.data === undefined ? undefined : scrubData(breadcrumb.data),
  };
}

export function scrubEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  const scrubbed: Sentry.ErrorEvent = { ...event };
  if (event.request) {
    scrubbed.request = { url: event.request.url ? scrubText(event.request.url) : undefined };
  }
  scrubbed.user = event.user?.id === undefined ? undefined : { id: event.user.id };
  if (event.message !== undefined) scrubbed.message = scrubText(event.message);
  if (event.exception?.values) {
    scrubbed.exception = {
      ...event.exception,
      values: event.exception.values.map((exception) => ({
        ...exception,
        value: exception.value === undefined ? undefined : scrubText(exception.value),
      })),
    };
  }
  if (event.breadcrumbs) scrubbed.breadcrumbs = event.breadcrumbs.map(scrubBreadcrumb);
  return scrubbed;
}

/** Starts Sentry in a production build with a DSN. Call once, before the app renders. */
export function initCrashReporting(): void {
  if (enabled || __DEV__ || !DSN) return;
  enabled = true;
  Sentry.init({
    dsn: DSN,
    sendDefaultPii: false,
    attachScreenshot: false,
    attachViewHierarchy: false,
    beforeSend: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
  });
}

/** Tags later reports with the Supabase user id only. */
export function setCrashReportingUser(userId: string): void {
  if (enabled) Sentry.setUser({ id: userId });
}
