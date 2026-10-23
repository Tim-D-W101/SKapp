import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  colors,
  getScoreColor,
  shareCardColors,
  type ColorName,
  type ColorSchemeName,
} from './colors.ts';

/** WCAG 2.x relative luminance of a #RRGGBB colour. */
function luminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** AA for body text, and for the outlines and fills that identify controls. */
const TEXT = 4.5;
const GRAPHIC = 3;

const SCHEMES: readonly ColorSchemeName[] = ['light', 'dark'];
const BACKGROUNDS: readonly ColorName[] = [
  'background',
  'surface',
  'surfaceElevated',
  'accentSubtle',
];
const TEXT_COLORS: readonly ColorName[] = [
  'textPrimary',
  'textSecondary',
  'textTertiary',
  'accentText',
  'success',
  'warning',
  'danger',
];

describe('palette contrast', () => {
  for (const scheme of SCHEMES) {
    const palette = colors[scheme];

    for (const text of TEXT_COLORS) {
      for (const background of BACKGROUNDS) {
        it(`${scheme}: ${text} on ${background} meets ${TEXT}:1`, () => {
          const ratio = contrast(palette[text], palette[background]);
          assert.ok(ratio >= TEXT, `${ratio.toFixed(2)}:1`);
        });
      }
    }

    for (const fill of ['accent', 'accentPressed', 'danger'] as const) {
      it(`${scheme}: button text on ${fill} meets ${TEXT}:1`, () => {
        const ratio = contrast(palette.textInverse, palette[fill]);
        assert.ok(ratio >= TEXT, `${ratio.toFixed(2)}:1`);
      });
    }

    for (const graphic of ['accent', 'borderStrong'] as const) {
      for (const background of BACKGROUNDS) {
        it(`${scheme}: ${graphic} on ${background} meets ${GRAPHIC}:1`, () => {
          const ratio = contrast(palette[graphic], palette[background]);
          assert.ok(ratio >= GRAPHIC, `${ratio.toFixed(2)}:1`);
        });
      }
    }

    it(`${scheme}: the score scale steps by lightness alone`, () => {
      const steps = palette.score.map(luminance);
      // Light mode runs pale to deep, dark mode dim to bright.
      const ordered =
        scheme === 'light' ? [...steps].sort((a, b) => b - a) : [...steps].sort((a, b) => a - b);
      assert.deepEqual(steps, ordered);
    });
  }

  it('share card text meets 4.5:1 on the card', () => {
    for (const text of [shareCardColors.text, shareCardColors.textMuted]) {
      const ratio = contrast(text, shareCardColors.background);
      assert.ok(ratio >= TEXT, `${ratio.toFixed(2)}:1`);
    }
  });
});

describe('getScoreColor', () => {
  const scale = colors.light.score;

  it('puts scores in five equal bands', () => {
    const cases: [score: number, step: number][] = [
      [0, 0],
      [19, 0],
      [20, 1],
      [39, 1],
      [40, 2],
      [60, 3],
      [79, 3],
      [80, 4],
      [100, 4],
    ];
    for (const [score, step] of cases) {
      assert.equal(getScoreColor(score, colors.light), scale[step], `score ${score}`);
    }
  });

  it('clamps scores outside 0-100', () => {
    assert.equal(getScoreColor(-5, colors.light), scale[0]);
    assert.equal(getScoreColor(150, colors.light), scale[4]);
  });
});
