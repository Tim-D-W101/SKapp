/**
 * The vision model, in one place. Swapping model is a one-line change to
 * `name` (and the prices, for the cost log). The model name is stored on every
 * scan row next to the prompt version, so results stay traceable.
 *
 * Claude Haiku 5.5, through Anthropic's Messages API with plain fetch, so
 * nothing is added to the function's dependencies. The step up if quality
 * falls short is a higher effort level, then Claude Sonnet 5.5
 * (`claude-sonnet-5-5`); check its page in Anthropic's docs first, because
 * effort levels and thinking settings differ between models. Rerun the
 * calibration harness (scripts/calibrate.ts) after any change here.
 *
 * There is no temperature setting: Claude Haiku 5.5 rejects any value other
 * than its default. Consistency comes from the prompt, the response schema
 * and the calibration gate.
 */
export const MODEL = {
  name: 'claude-haiku-5-5',
  apiUrl: 'https://api.anthropic.com/v1/messages',
  /** Sent as the anthropic-version header. */
  apiVersion: '2023-06-01',
  /**
   * US dollars per million tokens, from Anthropic's price list (October
   * 2026). These are the rates for prompts up to 100,000 tokens; a scan's
   * prompt is a few thousand.
   */
  pricing: {
    inputPerMillionTokens: 0.1,
    outputPerMillionTokens: 0.5,
  },
  generation: {
    /**
     * How much work goes into the reply: 'low', 'medium' (the model's
     * default), 'high', 'xhigh' or 'max'. Low suits one short, structured
     * reply. If the calibration runs fall short, try 'medium' first.
     */
    effort: 'low',
    /**
     * 'disabled' answers straight away; 'adaptive' lets the model decide how
     * much to think first. Claude Haiku 5.5 accepts 'disabled' only at effort
     * 'high' or below.
     */
    thinking: 'disabled',
    /** A ceiling against runaway output. A normal reply uses a small fraction. */
    maxOutputTokens: 8192,
  },
  /** Per call. The Edge Function makes at most two calls per scan. */
  timeoutMs: 25_000,
} as const;

/** Estimated cost of one call, in US dollars. */
export function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  const { inputPerMillionTokens, outputPerMillionTokens } = MODEL.pricing;
  return (inputTokens * inputPerMillionTokens + outputTokens * outputPerMillionTokens) / 1_000_000;
}
