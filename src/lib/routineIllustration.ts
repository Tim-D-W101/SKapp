import type { TintName } from '@/theme/colors';
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

/**
 * Each drawing's colour, so the kinds of step are told apart at a glance: a
 * sunny sunscreen and face oil, coral serum and lip balm, lavender for the
 * eyes and makeup removal, sky-blue cleanser and toner, and the brand mint
 * for moisturiser and anything else. A usual morning (cleanser, serum,
 * moisturiser, sunscreen) shows four different colours.
 */
const TINTS: Record<ProductIllustration, TintName> = {
  makeupRemover: 'lavender',
  cleanser: 'sky',
  toner: 'sky',
  serum: 'coral',
  eyeCream: 'lavender',
  moisturiser: 'mint',
  faceOil: 'sun',
  lipBalm: 'coral',
  sunscreen: 'sun',
  generic: 'mint',
};

/** The colour a product drawing is drawn in, and its tile's colour. */
export function tintForIllustration(kind: ProductIllustration): TintName {
  return TINTS[kind];
}
