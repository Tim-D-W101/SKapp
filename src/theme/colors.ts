/**
 * Every colour in the app. Tune the palette here and nowhere else; the rest
 * of the design tokens live in tokens.ts, which re-exports all of this, so
 * components keep importing from '@/theme/tokens'.
 *
 * Fresh and bright: white screens, a very light peach tint for surfaces, and
 * one accent family of coral and peach. Text is a warm dark grey.
 *
 * Contrast (WCAG AA) is checked by colors.test.ts for every text colour on
 * every background below, and for white text on the coral fill. Run
 * `npm test` after changing a value.
 *
 * This file has no imports, so the contrast test can load it directly.
 *
 * The launcher icon and splash screen are not drawn from this palette: they
 * keep the teal sun mark in assets/source, and app.json copies their colours.
 */

/**
 * Five steps from low (index 0) to high (index 4). One warm hue, pale peach
 * deepening to terracotta, stepped by lightness, so the order reads for
 * everyone, including people with colour-vision deficiency, without relying
 * on hue at all. Light mode runs pale to deep; dark mode flips so the high
 * end is the brightest.
 *
 * The hue sits a little more orange than the coral accent, so no step reads
 * as red. Low scores are a quiet pale peach, never an alarm colour. The status
 * colours (success, warning, danger) are reserved for actions and states and
 * are never used for scores.
 */
export type ScoreScale = readonly [string, string, string, string, string];

export interface ColorPalette {
  /** Screen background — white in light mode, deep warm ink in dark mode. */
  background: string;
  /** Cards and grouped content sitting on the background: a light peach tint. */
  surface: string;
  /** Sheets, inputs and anything floating above a surface. */
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
  /** The coral fill: primary buttons, ticks, rings and highlights. */
  accent: string;
  /** Pale peach behind selected and highlighted things. */
  accentSubtle: string;
  accentPressed: string;
  /** Deeper coral for accent text and links. Meets 4.5:1 on every surface. */
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
  surface: '#FFF6F1',
  surfaceElevated: '#FFFFFF',
  border: '#F1D8CC',
  borderSubtle: '#F6E6DE',
  borderStrong: '#9C7A6C',
  textPrimary: '#2B211D',
  textSecondary: '#5B4C45',
  textTertiary: '#76655D',
  textInverse: '#FFFFFF',
  // Darkened from a brighter coral so white button text keeps 4.5:1.
  accent: '#CF412A',
  accentSubtle: '#FFE7DC',
  accentPressed: '#B23720',
  accentText: '#A9341E',
  success: '#26703F',
  warning: '#935400',
  // Raspberry rather than red, so it never reads as the coral accent.
  danger: '#B0203F',
  score: ['#F8C7AE', '#F2A47C', '#E5824F', '#C8642F', '#9C4A1F'],
};

const darkColors: ColorPalette = {
  background: '#17110F',
  surface: '#221916',
  surfaceElevated: '#2D221E',
  border: '#4D3C35',
  borderSubtle: '#352925',
  borderStrong: '#94786D',
  textPrimary: '#FBF0EB',
  textSecondary: '#D9C8C1',
  textTertiary: '#BCA9A1',
  textInverse: '#17110F',
  // Brighter for dark mode; buttons carry dark text on it.
  accent: '#FF8B6E',
  accentSubtle: '#43271F',
  accentPressed: '#F0755A',
  accentText: '#FFA48C',
  success: '#74D19B',
  warning: '#F2B661',
  danger: '#FF91B4',
  score: ['#6B3F2A', '#955634', '#C47441', '#EE9862', '#FFC29A'],
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
  scrim: 'rgba(23, 17, 15, 0.6)',
  /** Behind buttons and the guidance line. */
  control: 'rgba(23, 17, 15, 0.55)',
  text: '#FFFFFF',
  ovalIdle: 'rgba(255, 255, 255, 0.75)',
  ovalReady: '#FF8B6E',
  shutter: '#FFFFFF',
} as const;

/** The scanning sweep over the photo while a scan is analysed. It sits on a photo, so it's fixed. */
export const scanSweepColor = '#FF8B6E';

/**
 * The shareable result card. A fixed look that doesn't follow light or dark
 * mode, so every shared image looks the same: bright peach, dark text and a
 * coral ring.
 */
export const shareCardColors = {
  background: '#FFE9DF',
  text: '#2B211D',
  /** Secondary text. Over 6:1 on the background. */
  textMuted: '#5B4C45',
  ring: '#CF412A',
  ringTrack: 'rgba(43, 33, 29, 0.1)',
  tile: 'rgba(255, 255, 255, 0.72)',
} as const;

/**
 * The product drawings on the routine screen and the in-app sun mark. They
 * are pictures, so they keep the same colours in light and dark mode; only
 * the tile behind a product follows the theme (`accentSubtle`).
 */
export const illustrationColors = {
  outline: '#8E3622',
  coral: '#EF6A4C',
  coralDeep: '#C9452C',
  peachDeep: '#F7A184',
  peach: '#FFC4AB',
  peachLight: '#FFE2D4',
  cream: '#FFF8F4',
  highlight: '#FFFFFF',
} as const;
