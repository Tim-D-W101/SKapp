/**
 * Every colour in the app. Tune the palette here and nowhere else; the rest
 * of the design tokens live in tokens.ts, which re-exports all of this, so
 * components keep importing from '@/theme/tokens'.
 *
 * The app is the colour of its icon. The palette is built around the three
 * colours of the launcher icon (`iconColors`): its teal is the accent, its
 * mint is the soft tint behind cards and highlights, and its cream is the
 * sun in the brand mark. Screens stay clean white; text is a deep teal ink.
 *
 * Contrast (WCAG AA) is checked by colors.test.ts for every text colour on
 * every background below, and for white text on the teal fill. Run
 * `npm test` after changing a value.
 *
 * This file has no imports, so the contrast test can load it directly.
 */

/**
 * The launcher icon's own colours, as drawn in assets/source/icon.svg and
 * exported to assets/icon.png and the adaptive icon layers. The test checks
 * that the icon and app.json still use them, so the two can't drift apart.
 */
export const iconColors = {
  /** The icon's background, and the adaptive icon's back layer. */
  teal: '#1D655D',
  /** The two arcs under the sun. */
  mint: '#96DAD0',
  /** The sun. */
  cream: '#F8F5F1',
} as const;

/**
 * Five steps from low (index 0) to high (index 4). One hue, the icon's mint
 * deepening to the icon's teal, stepped by lightness, so the order reads for
 * everyone, including people with colour-vision deficiency, without relying
 * on hue at all. Light mode runs pale to deep; dark mode flips so the high
 * end is the brightest.
 *
 * Low scores are a quiet pale mint, never an alarm colour. The status
 * colours (success, warning, danger) are reserved for actions and states and
 * are never used for scores.
 */
export type ScoreScale = readonly [string, string, string, string, string];

export interface ColorPalette {
  /** Screen background — white in light mode, deep teal ink in dark mode. */
  background: string;
  /** Cards and grouped content sitting on the background: a light mint tint. */
  surface: string;
  /** Sheets, inputs, the tab bar and anything floating above a surface. */
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  /** Outlines of tick boxes and radio marks. At least 3:1 on every surface. */
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  /** Captions and hints. Still meets 4.5:1 on every surface. */
  textTertiary: string;
  /** Text on accent or danger fills. */
  textInverse: string;
  /** The brand fill: primary buttons, the scan button, ticks, rings and highlights. */
  accent: string;
  /** Pale mint behind selected and highlighted things, such as the active tab. */
  accentSubtle: string;
  accentPressed: string;
  /** Accent-coloured text and links. Meets 4.5:1 on every surface. */
  accentText: string;
  success: string;
  warning: string;
  danger: string;
  score: ScoreScale;
}

/** Semantic colour names usable for text and fills (everything except the score scale). */
export type ColorName = Exclude<keyof ColorPalette, 'score'>;

export type ColorSchemeName = 'light' | 'dark';

const lightColors: ColorPalette = {
  background: '#FFFFFF',
  surface: '#F0F9F7',
  surfaceElevated: '#FFFFFF',
  border: '#C9E5DF',
  borderSubtle: '#DFF0EC',
  borderStrong: '#5B8A83',
  textPrimary: '#112E2A',
  textSecondary: '#3A5752',
  textTertiary: '#4D6B66',
  textInverse: '#FFFFFF',
  // The icon's teal, unchanged: white text on it is 6.8:1, so it needs no darker variant.
  accent: iconColors.teal,
  accentSubtle: '#DDF3EF',
  accentPressed: '#154C46',
  accentText: iconColors.teal,
  success: '#26703F',
  warning: '#935400',
  // Raspberry: warm against the cool teal, so it never reads as the accent.
  danger: '#B0203F',
  score: [iconColors.mint, '#6BC3B6', '#40A395', '#2A8478', iconColors.teal],
};

const darkColors: ColorPalette = {
  background: '#0C1615',
  surface: '#13221F',
  surfaceElevated: '#1A2D2A',
  border: '#2D4844',
  borderSubtle: '#203532',
  borderStrong: '#6C958F',
  textPrimary: '#EAF6F3',
  textSecondary: '#BDD4CF',
  textTertiary: '#9DB8B2',
  textInverse: '#0C1615',
  // The icon's mint, which glows on dark backgrounds; buttons carry dark text on it.
  accent: iconColors.mint,
  accentSubtle: '#173A35',
  accentPressed: '#7DCCC0',
  accentText: '#A3E1D8',
  success: '#86D7A0',
  warning: '#F2B661',
  danger: '#FF91B4',
  score: ['#285B54', '#317468', '#43998C', '#69C2B5', '#A8E3DA'],
};

export const colors: Record<ColorSchemeName, ColorPalette> = {
  light: lightColors,
  dark: darkColors,
};

/** Maps a 0-100 score onto the five-step score scale in equal bands. */
export function getScoreColor(score: number, palette: ColorPalette): string {
  const steps = palette.score.length;
  const clamped = Math.min(100, Math.max(0, score));
  const index = Math.min(steps - 1, Math.floor(clamped / (100 / steps)));
  return palette.score[index];
}

/**
 * Colours for screens drawn over a live camera feed. The feed looks the same
 * in light and dark mode, so these don't switch with the system setting.
 */
export const cameraColors = {
  background: '#000000',
  /** Dims everything outside the face oval. */
  scrim: 'rgba(12, 22, 21, 0.6)',
  /** Behind buttons and the guidance line. */
  control: 'rgba(12, 22, 21, 0.55)',
  text: '#FFFFFF',
  ovalIdle: 'rgba(255, 255, 255, 0.75)',
  ovalReady: iconColors.mint,
  shutter: '#FFFFFF',
} as const;

/** The scanning sweep over the photo while a scan is analysed. It sits on a photo, so it's fixed. */
export const scanSweepColor = iconColors.mint;

/**
 * The shareable result card. A fixed look that doesn't follow light or dark
 * mode, so every shared image looks the same: bright mint, dark text and a
 * teal ring.
 */
export const shareCardColors = {
  background: '#E2F4F0',
  text: '#112E2A',
  /** Secondary text. Over 6:1 on the background. */
  textMuted: '#3A5752',
  ring: iconColors.teal,
  ringTrack: 'rgba(17, 46, 42, 0.1)',
  tile: 'rgba(255, 255, 255, 0.72)',
} as const;

/**
 * The brand mark (SunMark) in the icon's colours: a teal sun over mint arcs
 * on light backgrounds, and the icon's cream sun over mint arcs on dark ones.
 */
export const sunMarkColors = {
  light: { sun: iconColors.teal, arcs: iconColors.mint },
  dark: { sun: iconColors.cream, arcs: iconColors.mint },
  /**
   * On the accent fill, such as the scan button. In light mode that fill is
   * the icon's teal, so the mark looks exactly like the launcher icon; in
   * dark mode it's mint, so the mark turns dark ink and teal.
   */
  onAccent: {
    light: { sun: iconColors.cream, arcs: iconColors.mint },
    dark: { sun: darkColors.textInverse, arcs: iconColors.teal },
  },
} as const;

/**
 * The product drawings on the routine screen. They are pictures, so they keep
 * the same colours in light and dark mode; only the tile behind a product
 * follows the theme (`accentSubtle`). Named by role, not hue, so the palette
 * can change without renaming them.
 */
export const illustrationColors = {
  outline: '#164A44',
  primary: '#33A091',
  primaryDeep: iconColors.teal,
  secondaryDeep: '#6CC6B9',
  secondary: iconColors.mint,
  secondaryLight: '#CDEFE9',
  cream: iconColors.cream,
  highlight: '#FFFFFF',
} as const;
