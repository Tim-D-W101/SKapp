/**
 * Every colour in the app. Tune the palette here and nowhere else; the rest
 * of the design tokens live in tokens.ts, which re-exports all of this, so
 * components keep importing from '@/theme/tokens'.
 *
 * The brand is the colour of its icon (`iconColors`): its teal fills Home's
 * hero panel, the primary buttons and the open tab, and marks what's done
 * (ticked steps, routine progress); its mint is the soft tint behind
 * highlights and selections, and the filled part of the score meter. Text is
 * a deep teal ink in light mode and a pale mint white in dark mode.
 *
 * There are two looks, chosen under Appearance in Settings (or following the
 * phone), each designed in its own right:
 * - Light is fresh and bright: clean white cards on a barely-there cool
 *   white screen, crisp hairlines, and colour where it means something.
 * - Dark is deep spruce ink with raised cards a clear step lighter, Home's
 *   hero in the icon's own teal, mint for the primary buttons and the open
 *   tab, and the supporting colours as rich jewel tones, not mud.
 *
 * Alongside the brand, four friendly supporting colours (`tints`: sun,
 * coral, peach and dusk) give the things that matter their own colour. Each
 * is used by meaning, the same way on every screen (see `TintName`), and
 * placed rather than poured: most cards are plain, and colour comes from
 * pills, discs, tiles and one tinted card at most per screen, never a
 * different tint on every card. Flat colour only: never a gradient, glow or
 * glass effect, and nothing purple.
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
  /** The sun on the icon, and the sun mark's sun in dark mode. */
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
 * - mint: the brand's own tint, for scores, the trend, selections and
 *   anything else without a colour of its own
 * - sun: the morning routine, where to focus, the weekly streak, the
 *   subscription
 * - coral: the warm nudges to come back: reminders, their times and the
 *   bell on them
 * - peach: your latest scan and how it moved: the change pill on Home's
 *   hero, and Progress' latest score
 * - dusk: the evening routine, a calm twilight blue beside the morning's sun
 *
 * On Home the teal hero holds the latest score with its peach change pill;
 * the morning and evening tiles are the only tinted surfaces, and reminders
 * carry their coral on the bell and the time.
 */
export type TintName = 'mint' | 'sun' | 'coral' | 'peach' | 'dusk';

export const TINT_NAMES: readonly TintName[] = ['mint', 'sun', 'coral', 'peach', 'dusk'];

/**
 * The colours the routine's product drawings come in (see
 * routineIllustration.ts): the brand's mint and the two warm accents.
 */
export type IllustrationTint = Extract<TintName, 'mint' | 'sun' | 'coral'>;

export const ILLUSTRATION_TINTS: readonly IllustrationTint[] = ['mint', 'sun', 'coral'];

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
  /** Screen background: a barely-there cool white in light mode, deep spruce ink in dark mode. */
  background: string;
  /**
   * Cards and grouped content sitting on the background: clean white in
   * light mode, a clear step lighter than the screen in dark mode.
   */
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
  /**
   * Home's hero panel (the latest score and "Scan my skin"): the icon's teal
   * in both looks, so the app's biggest block of colour is always its own.
   * In dark mode it stays a deep teal rather than turning mint, so it glows
   * without glaring.
   */
  brand: string;
  brandPressed: string;
  /** Text and icons on `brand`. */
  onBrand: string;
  /** Quieter text on `brand`, such as the line under the score on Home. Meets 4.5:1 on it. */
  onBrandSecondary: string;
  /** The empty part of the score meter on `brand`, with the icon's mint for the filled part. */
  brandTrack: string;
  /** The button on `brand` ("Scan my skin" on Home): a light pill, so it reads as the next step. */
  brandAction: string;
  brandActionPressed: string;
  /** Its label and icon. Meets 4.5:1 on it, pressed too. */
  onBrandAction: string;
  /** The primary fill: primary buttons, the open tab, the routine's ring and highlights. */
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
  // A barely-there cool white, so the clean white cards on it read at a glance.
  background: '#F4F7F6',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#DCE4E2',
  borderSubtle: '#E7EDEB',
  borderStrong: '#4F7C75',
  textPrimary: '#112E2A',
  textSecondary: '#3A5752',
  textTertiary: '#46625D',
  textInverse: '#FFFFFF',
  brand: iconColors.teal,
  brandPressed: '#154C46',
  onBrand: '#FFFFFF',
  onBrandSecondary: '#CDEDE7',
  brandTrack: '#154C46',
  brandAction: '#FFFFFF',
  brandActionPressed: '#D9F3EE',
  onBrandAction: iconColors.teal,
  // The icon's teal, unchanged: white text on it is 6.8:1, so it needs no darker variant.
  accent: iconColors.teal,
  accentSubtle: '#D9F3EE',
  accentPressed: '#154C46',
  accentText: iconColors.teal,
  success: '#246B3C',
  warning: '#8F5100',
  // Raspberry: warm against the cool teal, so it never reads as the accent.
  danger: '#B0203F',
  score: [iconColors.mint, '#6BC3B6', '#40A395', '#2A8478', iconColors.teal],
  tints: {
    mint: { soft: '#D9F3EE', fill: iconColors.mint, text: iconColors.teal, onFill: '#112E2A' },
    // A warm sun yellow. Its text variant is a deep golden brown.
    sun: { soft: '#FFF0BF', fill: '#FFC93D', text: '#7A5300', onFill: '#4A3300' },
    // A lively coral, pinker than the peach, so the two never read as one.
    coral: { soft: '#FFDFD8', fill: '#FF7F6B', text: '#A8382A', onFill: '#4F150C' },
    // A bright apricot, more orange than coral and clear of skin tones.
    peach: { soft: '#FFD6B0', fill: '#FFA866', text: '#86400E', onFill: '#4A2409' },
    // A muted twilight blue, well away from purple.
    dusk: { soft: '#E1EAFB', fill: '#8FABE6', text: '#2C4B84', onFill: '#12244A' },
  },
};

const darkColors: ColorPalette = {
  // Deep spruce ink; cards sit a clear step lighter, since shadows don't show on dark.
  background: '#0A1211',
  surface: '#172625',
  surfaceElevated: '#1E2E2C',
  border: '#2E4440',
  borderSubtle: '#243532',
  borderStrong: '#6C958F',
  textPrimary: '#EEF7F5',
  textSecondary: '#BCD2CD',
  textTertiary: '#9DB8B2',
  textInverse: '#0A1211',
  // The icon's teal, a touch brighter so it stands off the dark screen (3:1).
  brand: '#1F6E64',
  brandPressed: '#185A52',
  onBrand: '#FFFFFF',
  onBrandSecondary: '#CDEDE7',
  brandTrack: '#134A43',
  brandAction: '#EEF7F5',
  brandActionPressed: '#CBE6E0',
  onBrandAction: '#14524B',
  // The icon's mint, which glows on dark backgrounds; buttons carry dark text on it.
  accent: iconColors.mint,
  accentSubtle: '#11433C',
  accentPressed: '#7DCCC0',
  accentText: '#A3E1D8',
  success: '#86D7A0',
  warning: '#F2B661',
  danger: '#FF91B4',
  score: ['#285B54', '#317468', '#43998C', '#69C2B5', '#A8E3DA'],
  // Rich jewel tones for tinted cards and rows (terracotta, rosewood, gold,
  // navy, deep teal), each colour bright and pale on top.
  tints: {
    mint: { soft: '#11433C', fill: iconColors.mint, text: '#A3E1D8', onFill: '#0A1211' },
    // A deep amber gold behind the morning, warm rather than olive.
    sun: { soft: '#3E2F0C', fill: '#FFD466', text: '#FFDC7A', onFill: '#0A1211' },
    coral: { soft: '#5A2A26', fill: '#FF9A87', text: '#FFBCB0', onFill: '#0A1211' },
    peach: { soft: '#55301F', fill: '#FFB98A', text: '#FFCFAD', onFill: '#0A1211' },
    dusk: { soft: '#1C2C52', fill: '#A3BAEC', text: '#BCCCF5', onFill: '#0A1211' },
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
   * On the brand fill, Home's hero panel, which is the icon's teal in both
   * looks: the sun rises in sun yellow over the icon's mint arcs, as it does
   * before the first scan.
   */
  onBrand: {
    light: { sun: lightColors.tints.sun.fill, arcs: iconColors.mint },
    dark: { sun: darkColors.tints.sun.fill, arcs: iconColors.mint },
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
export const illustrationColors: Record<IllustrationTint, IllustrationInk> = {
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
