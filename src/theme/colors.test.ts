import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  colors,
  getScoreColor,
  iconColors,
  ILLUSTRATION_TINTS,
  illustrationColors,
  shareCardColors,
  sunMarkColors,
  TINT_NAMES,
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

/** A file from the repository, by its path from the root. */
function readRepoFile(path: string): string {
  return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
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

    // Buttons, and the "Scan my skin" card's title and line (accent, and accentPressed while pressed).
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

  it('share card ring meets 3:1 on the card', () => {
    const ratio = contrast(shareCardColors.ring, shareCardColors.background);
    assert.ok(ratio >= GRAPHIC, `${ratio.toFixed(2)}:1`);
  });
});

describe('supporting colours', () => {
  for (const scheme of SCHEMES) {
    const palette = colors[scheme];

    for (const name of TINT_NAMES) {
      const tint = palette.tints[name];

      // Every card can be tinted, so every text colour must read on every tint.
      for (const text of TEXT_COLORS) {
        it(`${scheme}: ${text} on the ${name} card meets ${TEXT}:1`, () => {
          const ratio = contrast(palette[text], tint.soft);
          assert.ok(ratio >= TEXT, `${ratio.toFixed(2)}:1`);
        });
      }

      for (const background of [...BACKGROUNDS, 'tint'] as const) {
        it(`${scheme}: ${name} text on ${background} meets ${TEXT}:1`, () => {
          const behind = background === 'tint' ? tint.soft : palette[background];
          const ratio = contrast(tint.text, behind);
          assert.ok(ratio >= TEXT, `${ratio.toFixed(2)}:1`);
        });
      }

      it(`${scheme}: icons on the ${name} badge meet ${TEXT}:1`, () => {
        const ratio = contrast(tint.onFill, tint.fill);
        assert.ok(ratio >= TEXT, `${ratio.toFixed(2)}:1`);
      });

      it(`${scheme}: a tick on a ${name} tick box meets ${TEXT}:1`, () => {
        const ratio = contrast(palette.textInverse, tint.text);
        assert.ok(ratio >= TEXT, `${ratio.toFixed(2)}:1`);
      });

      // Unticked boxes, switches, chips and outlined buttons sit on tinted cards too.
      for (const graphic of ['accent', 'borderStrong'] as const) {
        it(`${scheme}: ${graphic} on the ${name} card meets ${GRAPHIC}:1`, () => {
          const ratio = contrast(palette[graphic], tint.soft);
          assert.ok(ratio >= GRAPHIC, `${ratio.toFixed(2)}:1`);
        });
      }

      it(`${scheme}: a ${name} progress bar shows on its track (${GRAPHIC}:1)`, () => {
        const ratio = contrast(tint.text, palette.background);
        assert.ok(ratio >= GRAPHIC, `${ratio.toFixed(2)}:1`);
      });
    }

    it(`${scheme}: mint is the brand's own tint`, () => {
      assert.equal(palette.tints.mint.soft, palette.accentSubtle);
      assert.equal(palette.tints.mint.text, palette.accentText);
      assert.equal(palette.tints.mint.fill, iconColors.mint);
    });

    it(`${scheme}: every supporting colour is its own colour`, () => {
      for (const strength of ['soft', 'fill', 'text'] as const) {
        const values = TINT_NAMES.map((name) => palette.tints[name][strength]);
        assert.equal(new Set(values).size, values.length, strength);
      }
    });
  }

  for (const name of ILLUSTRATION_TINTS) {
    const ink = illustrationColors[name];

    it(`${name} drawings: the outline shows on the light tile (${GRAPHIC}:1)`, () => {
      const ratio = contrast(ink.outline, colors.light.tints[name].soft);
      assert.ok(ratio >= GRAPHIC, `${ratio.toFixed(2)}:1`);
    });

    it(`${name} drawings: the body colour shows on the dark tile (${GRAPHIC}:1)`, () => {
      const ratio = contrast(ink.secondary, colors.dark.tints[name].soft);
      assert.ok(ratio >= GRAPHIC, `${ratio.toFixed(2)}:1`);
    });
  }

  it('light screens stay pure white', () => {
    assert.equal(luminance(colors.light.background), 1);
    assert.equal(luminance(colors.light.surfaceElevated), 1);
  });

  it('the score scale stays mint to teal, with no supporting colour in it', () => {
    for (const scheme of SCHEMES) {
      const tintColors = TINT_NAMES.filter((name) => name !== 'mint').flatMap((name) =>
        Object.values(colors[scheme].tints[name]),
      );
      for (const step of colors[scheme].score) {
        assert.ok(!tintColors.includes(step), `${scheme}: ${step}`);
      }
    }
  });
});

describe('palette and app icon', () => {
  it("uses the icon's teal as the light accent, unchanged", () => {
    assert.equal(colors.light.accent, iconColors.teal);
    assert.equal(colors.light.accentText, iconColors.teal);
  });

  it("uses the icon's mint as the dark accent", () => {
    assert.equal(colors.dark.accent, iconColors.mint);
  });

  it('matches the colours the icon artwork is drawn in', () => {
    for (const file of ['icon.svg', 'favicon.svg', 'splash-icon.svg']) {
      const svg = readRepoFile(`assets/source/${file}`).toUpperCase();
      for (const color of Object.values(iconColors)) {
        assert.ok(svg.includes(color), `${file} has no ${color}`);
      }
    }
    const back = readRepoFile('assets/source/android-icon-background.svg').toUpperCase();
    assert.ok(back.includes(iconColors.teal), 'adaptive icon back layer');
  });

  it("matches app.json's adaptive icon background", () => {
    const config: unknown = JSON.parse(readRepoFile('app.json'));
    const background = (
      config as { expo: { android: { adaptiveIcon: { backgroundColor: string } } } }
    ).expo.android.adaptiveIcon.backgroundColor;
    assert.equal(background.toUpperCase(), iconColors.teal);
  });

  for (const scheme of SCHEMES) {
    it(`${scheme}: the sun mark on Home's scan card meets ${GRAPHIC}:1`, () => {
      for (const color of Object.values(sunMarkColors.onAccent[scheme])) {
        const ratio = contrast(color, colors[scheme].accent);
        assert.ok(ratio >= GRAPHIC, `${color}: ${ratio.toFixed(2)}:1`);
      }
    });
  }
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
