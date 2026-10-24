/**
 * Every colour in the app. Tune the palette here and nowhere else; the rest
 * of the design tokens live in tokens.ts, which re-exports all of this, so
 * components keep importing from '@/theme/tokens'.
 *
 * The brand is the colour of its icon. The palette is built around the three
 * colours of the launcher icon (`iconColors`): its teal is the accent, its
 * mint is the soft tint behind highlights and selections, and its cream is
 * the warm, paper-like surface of cards. Screens stay clean white; text is a
 * deep teal ink.
 *
 * Alongside the brand, two warm supporting colours (`tints`: sun and coral)
 * add a little friendliness in a few chosen places, so screens are neither
 * all one teal nor a rainbow. They are used by meaning, the same way on
 * every screen (see `TintName`); most cards stay cream with a teal badge.
 * The brand teal keeps the primary buttons, the tab bar and the sun mark.
 *
 * Contrast (WCAG AA) is checked by colors.test.ts for every text colour on
 * every background below, tinted ones included, and for white text on the
 * teal fill. Run `npm test` after changing a value.
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
  /** The sun, and the cards' surface in light mode. */
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

/**
 * The supporting colours, each used for one kind of thing on every screen:
 * - mint: the brand's own tint, for scores, the evening routine, the trend
 *   and anything else without a colour of its own
 * - sun: the morning routine, the camera on Home's scan card, where to focus,
 *   the weekly streak, the subscription
 * - coral: reminders
 */
export type TintName = 'mint' | 'sun' | 'coral';

export const TINT_NAMES: readonly TintName[] = ['mint', 'sun', 'coral'];

/** One supporting colour, in the four strengths it's used at. */
export interface Tint {
  /** The soft background of a card, row or tile in this colour. */
  soft: string;
  /** The bright colour itself: icon discs and other decoration. Not for text. */
  fill: string;
  /**
   * Text, icons, ticks, chart lines and progress bars in this colour: deep
   * in light mode, pale in dark mode. Meets 4.5:1 on its soft background and
   * on every screen background.
   */
  text: string;
  /** Icons and text drawn on `fill`. Meets 4.5:1 on it. */
  onFill: string;
}

export interface ColorPalette {
  /** Screen background — white in light mode, deep teal ink in dark mode. */
  background: string;
  /** Cards and grouped content sitting on the background: the icon's warm cream in light mode. */
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
  /** The brand fill: primary buttons, Home's scan card, the routine's ring and highlights. */
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
  tints: Record<TintName, Tint>;
}

/** Semantic colour names usable for text and fills (everything except the score scale and tints). */
export type ColorName = Exclude<keyof ColorPalette, 'score' | 'tints'>;

export type ColorSchemeName = 'light' | 'dark';

const lightColors: ColorPalette = {
  background: '#FFFFFF',
  // Warm and paper-like rather than another shade of mint, so teal stands out on it.
  surface: iconColors.cream,
  surfaceElevated: '#FFFFFF',
  border: '#E3DDD3',
  borderSubtle: '#EDE8E0',
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
  tints: {
    mint: { soft: '#DDF3EF', fill: iconColors.mint, text: iconColors.teal, onFill: '#112E2A' },
    // A warm sun yellow. Its text variant is a deep golden brown.
    sun: { soft: '#FFF4D6', fill: '#FFC83D', text: '#7A5300', onFill: '#4A3300' },
    coral: { soft: '#FFE9E4', fill: '#FF8F7A', text: '#A63A2A', onFill: '#5C1A10' },
  },
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
  // Deep, quiet tinted surfaces, with each colour bright and pale on top.
  tints: {
    mint: { soft: '#173A35', fill: iconColors.mint, text: '#A3E1D8', onFill: '#0C1615' },
    sun: { soft: '#2B2412', fill: '#FFD466', text: '#FFDA80', onFill: '#0C1615' },
    coral: { soft: '#2E1C19', fill: '#FF9E8C', text: '#FFB3A6', onFill: '#0C1615' },
  },
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
   * On the accent fill, such as Home's "Scan my skin" card. In light mode
   * that fill is the icon's teal, so the mark looks exactly like the launcher
   * icon; in dark mode it's mint, so the mark turns dark ink and teal.
   */
  onAccent: {
    light: { sun: iconColors.cream, arcs: iconColors.mint },
    dark: { sun: darkColors.textInverse, arcs: iconColors.teal },
  },
} as const;

/** The colours of one product drawing, named by role so each tint has the same set. */
export interface IllustrationInk {
  /** The outline every shape shares. */
  outline: string;
  primary: string;
  primaryDeep: string;
  secondaryDeep: string;
  /** The main body colour: the tint's own bright colour. */
  secondary: string;
  secondaryLight: string;
  cream: string;
  highlight: string;
}

const illustrationBase = { cream: iconColors.cream, highlight: '#FFFFFF' } as const;

/**
 * The product drawings on the routine screen, one family of colours per tint:
 * each kind of step is drawn in its own colour (routineIllustration.ts picks
 * which), on a tile of the same tint. They are pictures, so they keep the
 * same colours in light and dark mode; only the tile behind a product
 * follows the theme.
 */
export const illustrationColors: Record<TintName, IllustrationInk> = {
  mint: {
    ...illustrationBase,
    outline: '#164A44',
    primary: '#33A091',
    primaryDeep: iconColors.teal,
    secondaryDeep: '#6CC6B9',
    secondary: iconColors.mint,
    secondaryLight: '#CDEFE9',
  },
  sun: {
    ...illustrationBase,
    outline: '#6B4A00',
    primary: '#F2A900',
    primaryDeep: '#C98400',
    secondaryDeep: '#FFB81F',
    secondary: '#FFD45C',
    secondaryLight: '#FFEDB8',
  },
  coral: {
    ...illustrationBase,
    outline: '#7A2A1E',
    primary: '#F2715C',
    primaryDeep: '#D2503B',
    secondaryDeep: '#FF9A87',
    secondary: '#FFB8A9',
    secondaryLight: '#FFDAD2',
  },
};
