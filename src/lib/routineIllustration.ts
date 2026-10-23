import type { RoutineStep } from '@/types/routine';

/**
 * Which product drawing a routine step shows. Pure, with type-only imports,
 * so its test runs in plain Node.
 */

/** The product drawings: one for each kind of routine step, and a generic one. */
export const PRODUCT_ILLUSTRATIONS = [
  'makeupRemover',
  'cleanser',
  'toner',
  'serum',
  'eyeCream',
  'moisturiser',
  'faceOil',
  'lipBalm',
  'sunscreen',
  'generic',
] as const;

export type ProductIllustration = (typeof PRODUCT_ILLUSTRATIONS)[number];

/**
 * Step categories to drawings. The keys are analyze-scan's ROUTINE_STEP_KEYS
 * (supabase/functions/analyze-scan/prompt.ts): the response schema only lets
 * the model use those, so a step's key decides its drawing, never its
 * free-text title. The test fails if a key is added there and not here.
 */
const BY_STEP_KEY = new Map<string, ProductIllustration>([
  ['makeup_removal', 'makeupRemover'],
  ['cleanse', 'cleanser'],
  ['tone', 'toner'],
  ['serum', 'serum'],
  ['eye_care', 'eyeCream'],
  ['moisturise', 'moisturiser'],
  ['face_oil', 'faceOil'],
  ['lip_care', 'lipBalm'],
  ['sunscreen', 'sunscreen'],
]);

/**
 * The drawing for a routine step. Anything unrecognised, such as a key the
 * server starts using before the app has a drawing for it, gets the generic
 * one rather than nothing.
 */
export function illustrationForStep(step: Pick<RoutineStep, 'key'>): ProductIllustration {
  return BY_STEP_KEY.get(step.key.trim().toLowerCase()) ?? 'generic';
}
