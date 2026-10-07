import { FUNCTION_TIMEOUT_MS, REQUEST_TIMEOUT_MS, UPLOAD_TIMEOUT_MS } from '@/constants/network';

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function requestMethod(input: RequestInfo | URL, init: RequestInit | undefined): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof input === 'object' && !(input instanceof URL)) return input.method.toUpperCase();
  return 'GET';
}

/** The limit for one request: longer for the analysis and for sending files. */
export function timeoutFor(input: RequestInfo | URL, init?: RequestInit): number {
  const url = requestUrl(input);
  if (url.includes('/functions/v1/')) return FUNCTION_TIMEOUT_MS;
  const method = requestMethod(input, init);
  if (url.includes('/storage/v1/object/') && (method === 'POST' || method === 'PUT')) {
    return UPLOAD_TIMEOUT_MS;
  }
  return REQUEST_TIMEOUT_MS;
}

/**
 * fetch, abandoned after `timeoutFor` milliseconds. An abandoned request
 * rejects with an AbortError, which the Supabase clients report as a
 * connection failure. A signal the caller passed still works.
 */
export function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const callerSignal = init?.signal;
  if (callerSignal?.aborted) controller.abort();
  else callerSignal?.addEventListener('abort', () => controller.abort());

  const timer = setTimeout(() => controller.abort(), timeoutFor(input, init));
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}
