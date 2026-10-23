import { z } from 'zod';

import { findBannedTerms, findRoutineProblems } from './compliance.ts';
import { estimateCostUsd, MODEL } from './model.ts';
import {
  ATTRIBUTE_KEYS,
  REJECT_REASONS,
  RESPONSE_SCHEMA,
  RETRY_INSTRUCTION,
  ROUTINE_STEP_KEYS,
  SYSTEM_PROMPT,
  USER_INSTRUCTION,
  type AttributeKey,
  type RejectReason,
} from './prompt.ts';
import { buildRoutine, type RoutineStep } from './routine.ts';
import { clampScore, weightedOverall } from './scoring.ts';

/**
 * One photo in, validated scores out. Shared by the analyze-scan Edge
 * Function and the calibration harness, so both run exactly the same path:
 * the same prompt, model, settings, validation and retry.
 *
 * Nothing here logs. Callers decide what to record, and never record the image.
 */

export type AnalysisErrorCode = 'MODEL_TIMEOUT' | 'MODEL_INVALID_RESPONSE' | 'INTERNAL';

export interface Usage {
  inputTokens: number;
  /** Includes the model's thinking tokens, which are billed as output. */
  outputTokens: number;
  costUsd: number;
}

/** One call to the model. `problem` says why its reply wasn't used, or is null when it was. */
export interface Attempt {
  problem: string | null;
  /** Banned terms, or routine rules broken, that made the reply unusable, if that was the problem. */
  bannedTerms: string[];
  usage: Usage | null;
}

export class AnalysisError extends Error {
  readonly code: AnalysisErrorCode;
  readonly attempts: Attempt[];

  constructor(code: AnalysisErrorCode, message: string, attempts: Attempt[]) {
    super(message);
    this.name = 'AnalysisError';
    this.code = code;
    this.attempts = attempts;
  }
}

export interface ImageInput {
  base64: string;
  mimeType: string;
}

export interface ScoredAnalysis {
  usable: true;
  scores: Record<AttributeKey, number>;
  /** Recomputed from the attribute scores. */
  overall: number;
  /** The model's own overall, kept for comparison only. */
  modelOverall: number;
  headline: string;
  observations: string[];
  focusAreas: AttributeKey[];
  referToProfessional: boolean;
  /** Morning then evening steps, in order, sunscreen closing the morning. */
  routine: RoutineStep[];
  /** The validated model output, stored for debugging. */
  raw: unknown;
  attempts: Attempt[];
}

export interface RejectedAnalysis {
  usable: false;
  rejectReason: RejectReason;
  raw: unknown;
  attempts: Attempt[];
}

export type Analysis = ScoredAnalysis | RejectedAnalysis;

const MAX_OBSERVATIONS = 4;
const MAX_FOCUS_AREAS = 3;
const MAX_STEP_TITLE = 60;
const MAX_STEP_WHY = 200;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const score = z.number();

const looseStep = z.object({ key: z.string(), title: z.string(), why: z.string() });

const step = z.object({
  key: z.enum(ROUTINE_STEP_KEYS),
  title: z.string().trim().min(1).max(MAX_STEP_TITLE),
  why: z.string().trim().min(1).max(MAX_STEP_WHY),
});

const baseOutput = z.object({
  usable: z.boolean(),
  reject_reason: z.string().nullable(),
  observations: z.array(z.string()),
  clarity: score,
  texture: score,
  pores: score,
  hydration: score,
  redness: score,
  evenness: score,
  firmness: score,
  overall: score,
  headline: z.string(),
  focus_areas: z.array(z.string()),
  routine: z.object({ morning: z.array(looseStep), evening: z.array(looseStep) }),
  refer_to_professional: z.boolean(),
});

/** A usable reply needs real text; an unusable one needs a known reason. */
const modelOutput = z.discriminatedUnion('usable', [
  baseOutput.extend({
    usable: z.literal(true),
    observations: z.array(z.string().trim().min(1)).min(1),
    headline: z.string().trim().min(1),
    focus_areas: z.array(z.enum(ATTRIBUTE_KEYS)).min(1),
    routine: z.object({ morning: z.array(step), evening: z.array(step) }),
  }),
  baseOutput.extend({
    usable: z.literal(false),
    reject_reason: z.enum(REJECT_REASONS),
  }),
]);

/** The parts of a Messages API reply we read. Unknown fields are ignored. */
const messagesReply = z.object({
  content: z.array(z.object({ type: z.string(), text: z.string().optional() })).optional(),
  stop_reason: z.string().nullable().optional(),
  stop_details: z.object({ category: z.string().nullable().optional() }).nullable().optional(),
  usage: z
    .object({
      input_tokens: z.number().optional(),
      output_tokens: z.number().optional(),
    })
    .optional(),
});

/** The body the Messages API sends with a failed request. */
const errorReply = z.object({
  error: z.object({ type: z.string().optional(), message: z.string().optional() }).optional(),
  request_id: z.string().optional(),
});

type Interpretation =
  | { ok: true; analysis: Omit<ScoredAnalysis, 'attempts'> | Omit<RejectedAnalysis, 'attempts'> }
  | { ok: false; problem: string; bannedTerms: string[] };

function interpret(text: string): Interpretation {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, problem: 'reply was not valid JSON', bannedTerms: [] };
  }

  const parsed = modelOutput.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join('.') || 'reply'}: ${issue.code}`)
      .join('; ');
    return { ok: false, problem: `reply did not match the schema (${issues})`, bannedTerms: [] };
  }

  const output = parsed.data;
  if (!output.usable) {
    return {
      ok: true,
      analysis: { usable: false, rejectReason: output.reject_reason, raw: output },
    };
  }

  const observations = output.observations.slice(0, MAX_OBSERVATIONS);
  const routineText = [...output.routine.morning, ...output.routine.evening]
    .map((routineStep) => `${routineStep.title}\n${routineStep.why}`)
    .join('\n');
  const bannedTerms = findBannedTerms([output.headline, ...observations, routineText].join('\n'));
  if (bannedTerms.length > 0) {
    return {
      ok: false,
      problem: `reply used banned vocabulary (${bannedTerms.join(', ')})`,
      bannedTerms,
    };
  }

  const routineProblems = findRoutineProblems(routineText);
  if (routineProblems.length > 0) {
    return {
      ok: false,
      problem: `routine broke its rules (${routineProblems.join(', ')})`,
      bannedTerms: routineProblems,
    };
  }

  const routine = buildRoutine(output.routine);
  if (!routine.ok) return { ok: false, problem: routine.problem, bannedTerms: [] };

  const scores = Object.fromEntries(
    ATTRIBUTE_KEYS.map((key) => [key, clampScore(output[key])]),
  ) as Record<AttributeKey, number>;

  return {
    ok: true,
    analysis: {
      usable: true,
      scores,
      overall: weightedOverall(scores),
      modelOverall: clampScore(output.overall),
      headline: output.headline,
      observations,
      focusAreas: [...new Set(output.focus_areas)].slice(0, MAX_FOCUS_AREAS),
      referToProfessional: output.refer_to_professional,
      routine: routine.steps,
      raw: output,
    },
  };
}

// ---------------------------------------------------------------------------
// The model call
// ---------------------------------------------------------------------------

interface Reply {
  text: string | null;
  /** Why there is no text, when there isn't. */
  problem: string;
  usage: Usage | null;
}

function transportError(error: unknown, attempts: Attempt[]): AnalysisError {
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
    return new AnalysisError('MODEL_TIMEOUT', `No reply within ${MODEL.timeoutMs} ms`, attempts);
  }
  const message = error instanceof Error ? error.message : String(error);
  return new AnalysisError('INTERNAL', `Model request failed: ${message}`, attempts);
}

/**
 * Error text that is safe to log. Whatever the API puts in its message, any
 * long unbroken run of characters (image data, a key) is cut out.
 */
function loggable(text: string): string {
  return text.replace(/[A-Za-z0-9+/=_-]{40,}/g, '[removed]').slice(0, 300);
}

/** Why a request failed, from the error body: type, message and request id. */
async function failureDetail(response: Response): Promise<string> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    // Unreadable or not JSON: the caller still reports the HTTP status.
    return '';
  }
  const parsed = errorReply.safeParse(body);
  if (!parsed.success) return '';
  const { error, request_id: requestId } = parsed.data;
  return loggable([error?.type, error?.message, requestId].filter(Boolean).join(' / '));
}

/**
 * The code for a failed HTTP response. Anthropic's own timeout (504) is a
 * MODEL_TIMEOUT, like ours. Everything else is INTERNAL: a rate limit (429),
 * overload (529) or other server error passes with time, and the app's
 * INTERNAL message asks the user to try again in a moment; any other 4xx is
 * a key, model or request problem on our side.
 */
function failureCode(status: number): AnalysisErrorCode {
  return status === 504 ? 'MODEL_TIMEOUT' : 'INTERNAL';
}

async function callModel(
  image: ImageInput,
  apiKey: string,
  retry: boolean,
  attempts: Attempt[],
): Promise<Reply> {
  const content: Record<string, unknown>[] = [
    { type: 'image', source: { type: 'base64', media_type: image.mimeType, data: image.base64 } },
    { type: 'text', text: USER_INSTRUCTION },
  ];
  if (retry) content.push({ type: 'text', text: RETRY_INSTRUCTION });

  let payload: unknown;
  try {
    const response = await fetch(MODEL.apiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': MODEL.apiVersion,
      },
      body: JSON.stringify({
        model: MODEL.name,
        max_tokens: MODEL.generation.maxOutputTokens,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
        thinking: { type: MODEL.generation.thinking },
        output_config: {
          effort: MODEL.generation.effort,
          format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
        },
      }),
      // Covers reading the body too, not just the headers.
      signal: AbortSignal.timeout(MODEL.timeoutMs),
    });
    if (!response.ok) {
      // "HTTP <status>" stays in the message: the calibration harness looks
      // for it to wait out a rate limit.
      const detail = await failureDetail(response);
      throw new AnalysisError(
        failureCode(response.status),
        `Model request failed with HTTP ${response.status}${detail ? `: ${detail}` : ''}`,
        attempts,
      );
    }
    payload = await response.json();
  } catch (error: unknown) {
    if (error instanceof AnalysisError) throw error;
    throw transportError(error, attempts);
  }

  const reply = messagesReply.safeParse(payload);
  if (!reply.success) return { text: null, problem: 'unexpected reply format', usage: null };

  const { content: blocks, stop_reason: stopReason, stop_details: stopDetails } = reply.data;
  const tokens = reply.data.usage;
  const inputTokens = tokens?.input_tokens ?? 0;
  const outputTokens = tokens?.output_tokens ?? 0;
  const usage: Usage | null = tokens
    ? { inputTokens, outputTokens, costUsd: estimateCostUsd(inputTokens, outputTokens) }
    : null;

  // A declined or cut-off reply may not match the schema, so it is not read.
  if (stopReason === 'refusal') {
    return {
      text: null,
      problem: `request declined (${stopDetails?.category ?? 'no category'})`,
      usage,
    };
  }
  if (stopReason === 'max_tokens') {
    return { text: null, problem: 'reply cut off at the output token limit', usage };
  }

  const text = (blocks ?? [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('');
  if (!text) {
    return { text: null, problem: `empty reply (stop reason ${stopReason ?? 'unknown'})`, usage };
  }
  return { text, problem: '', usage };
}

/**
 * Analyses one photo. Retries once, with a stricter instruction, when the
 * first reply can't be used. Throws AnalysisError when the model times out,
 * can't be reached, or fails twice.
 */
export async function analyseImage(image: ImageInput, apiKey: string): Promise<Analysis> {
  const attempts: Attempt[] = [];

  for (const retry of [false, true]) {
    const reply = await callModel(image, apiKey, retry, attempts);
    const result: Interpretation =
      reply.text === null
        ? { ok: false, problem: reply.problem, bannedTerms: [] }
        : interpret(reply.text);

    attempts.push({
      problem: result.ok ? null : result.problem,
      bannedTerms: result.ok ? [] : result.bannedTerms,
      usage: reply.usage,
    });
    if (result.ok) return { ...result.analysis, attempts };
  }

  throw new AnalysisError(
    'MODEL_INVALID_RESPONSE',
    'The model did not return a usable reply after one retry',
    attempts,
  );
}
