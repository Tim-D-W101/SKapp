import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BANNED_TERMS, ROUTINE_STEP_KEYS } from '../../supabase/functions/analyze-scan/prompt.ts';
import { copy } from '../constants/copy.ts';
import { TINT_NAMES } from '../theme/colors.ts';
import type { RoutineStep } from '../types/routine.ts';

import {
  illustrationForStep,
  PRODUCT_ILLUSTRATIONS,
  tintForIllustration,
  type ProductIllustration,
} from './routineIllustration.ts';

const EXAMPLES: readonly [key: string, expected: ProductIllustration][] = [
  // Every key the server can send.
  ['makeup_removal', 'makeupRemover'],
  ['cleanse', 'cleanser'],
  ['tone', 'toner'],
  ['serum', 'serum'],
  ['eye_care', 'eyeCream'],
  ['moisturise', 'moisturiser'],
  ['face_oil', 'faceOil'],
  ['lip_care', 'lipBalm'],
  ['sunscreen', 'sunscreen'],
  // Stray case and spaces.
  ['Cleanse', 'cleanser'],
  ['  sunscreen ', 'sunscreen'],
  ['EYE_CARE', 'eyeCream'],
  // Keys the app doesn't know: a later server version, or a slip.
  ['exfoliate', 'generic'],
  ['mask', 'generic'],
  ['spot_care', 'generic'],
  ['moisturize', 'generic'],
  ['eye care', 'generic'],
  ['', 'generic'],
  // Names an object lookup would find on its prototype.
  ['constructor', 'generic'],
  ['__proto__', 'generic'],
  ['toString', 'generic'],
];

function step(key: string, title = 'A step'): RoutineStep {
  return { key, title, why: 'Many people find this helpful.', slot: 'morning' };
}

describe('illustrationForStep', () => {
  for (const [key, expected] of EXAMPLES) {
    it(`draws "${key}" as ${expected}`, () => {
      assert.equal(illustrationForStep(step(key)), expected);
    });
  }

  it('goes by the key, never the title', () => {
    assert.equal(illustrationForStep(step('tone', 'A gentle cleanser')), 'toner');
    assert.equal(illustrationForStep(step('new_key', 'A broad-spectrum sunscreen')), 'generic');
  });

  it("has its own drawing for every key analyze-scan's schema allows", () => {
    const drawn = ROUTINE_STEP_KEYS.map((key) => illustrationForStep(step(key)));
    for (const [index, kind] of drawn.entries()) {
      assert.notEqual(kind, 'generic', `${ROUTINE_STEP_KEYS[index]} has no drawing`);
    }
    assert.equal(new Set(drawn).size, drawn.length, 'two keys share a drawing');
  });
});

describe('drawing labels', () => {
  const labels: Record<ProductIllustration, string> = copy.routine.illustrations;

  it('names every drawing for screen readers', () => {
    for (const kind of PRODUCT_ILLUSTRATIONS) {
      assert.match(labels[kind], /^Illustration of an? \S/, kind);
    }
  });

  it('stays within the cosmetic vocabulary', () => {
    for (const kind of PRODUCT_ILLUSTRATIONS) {
      for (const term of BANNED_TERMS) {
        assert.doesNotMatch(labels[kind], new RegExp(`\\b${term}`, 'i'), `${kind}: "${term}"`);
      }
    }
  });
});

describe('drawing colours', () => {
  it('draws every product in one of the supporting colours', () => {
    for (const kind of PRODUCT_ILLUSTRATIONS) {
      assert.ok(TINT_NAMES.includes(tintForIllustration(kind)), kind);
    }
  });

  it('uses every supporting colour', () => {
    const used = new Set(PRODUCT_ILLUSTRATIONS.map(tintForIllustration));
    assert.deepEqual([...used].sort(), [...TINT_NAMES].sort());
  });

  it('never shows two steps of a usual morning side by side in one colour', () => {
    const morning = ['cleanse', 'serum', 'moisturise', 'sunscreen'];
    const tints = morning.map((key) => tintForIllustration(illustrationForStep(step(key))));
    for (let index = 1; index < tints.length; index += 1) {
      assert.notEqual(tints[index], tints[index - 1], tints.join(', '));
    }
  });
});
