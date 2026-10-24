/**
 * Design tokens — the single source of truth for every visual value in the app.
 *
 * Nothing in the app may use a hardcoded colour, spacing value, radius or font
 * size. Every component imports from this file. Changing the look of the app
 * means editing values here, never hunting through components.
 */
import { Platform, useColorScheme } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { resolveColorScheme } from '@/lib/appearance';
import { useAppearanceStore } from '@/stores/useAppearanceStore';

import {
  colors,
  scanSweepColor,
  shareCardColors,
  type ColorPalette,
  type ColorSchemeName,
} from './colors';

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------

// Every colour value lives in colors.ts, so the palette is tuned in one place.
export {
  cameraColors,
  colors,
  getScoreColor,
  iconColors,
  ILLUSTRATION_TINTS,
  illustrationColors,
  shareCardColors,
  sunMarkColors,
  TINT_NAMES,
  type ColorName,
  type ColorPalette,
  type ColorSchemeName,
  type IllustrationInk,
  type IllustrationTint,
  type ScoreScale,
  type Tint,
  type TintName,
} from './colors';

/**
 * Light or dark, as chosen under Appearance in Settings: always light,
 * always dark, or the phone's own setting. Everything that picks colours by
 * scheme goes through this, so a choice made in Settings applies everywhere
 * at once, without a restart.
 */
export function useColorSchemeName(): ColorSchemeName {
  const preference = useAppearanceStore((state) => state.preference);
  const system = useColorScheme();
  return resolveColorScheme(preference, system);
}

/** Returns the palette for the light or dark look in use (useColorSchemeName). */
export function useColors(): ColorPalette {
  return colors[useColorSchemeName()];
}

// ---------------------------------------------------------------------------
// Spacing and radius
// ---------------------------------------------------------------------------

/** 4pt scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Generous, rounded and friendly: pill buttons and chips, soft cards. */
export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
} as const;

/** Page-level spacing, so every screen sits on the same margins. */
export const layout = {
  /** Space between the screen edge and its content. */
  gutter: 20,
  /** Default padding inside a card. */
  cardPadding: 20,
} as const;

// ---------------------------------------------------------------------------
// Component sizing and opacity
// ---------------------------------------------------------------------------

export const sizes = {
  /**
   * Minimum touch target for anything tappable: Android's 48dp. Smaller
   * controls get hitSlop to reach it.
   */
  minTouchTarget: 48,
  control: { sm: 40, md: 48, lg: 56 },
  chip: 40,
  icon: { sm: 16, md: 20, lg: 24, xl: 40 },
  iconStroke: 1.75,
  borderWidth: 1,
  /** A selected chip, plan or option, and a secondary button's outline. */
  borderWidthStrong: 2,
  scoreRing: { sm: 64, md: 128, lg: 188 },
  scoreRingStroke: { sm: 7, md: 12, lg: 16 },
  /** Height of an attribute score bar. */
  scoreBar: 10,
  /** The tick box on a routine step, and its border. */
  checkbox: 28,
  checkboxBorder: 2,
  /** An icon on a soft round badge: beside a list point, beside a card's title, or above a screen's title. */
  iconBadge: { sm: 28, md: 36, lg: 72 },
  /** Width of the sun mark: beside a screen title, or above it. Its height follows the artwork. */
  sunMark: { sm: 36, lg: 112 },
  /** The product drawing on a routine step, on its tile. */
  productIllustration: 56,
  /** The grab bar at the top of a bottom sheet. */
  sheetHandle: { width: 40, height: 4 },
  /** The most of the screen a tall bottom sheet covers; its content scrolls beyond that. */
  sheetMaxHeight: '85%',
  /**
   * A dialog over the screen, such as the time picker: its widest and its
   * tallest (its content scrolls beyond that), and the basis of an hour in
   * its grid, which fits four to a row, and of a minute, six to a row.
   */
  dialog: {
    maxWidth: 400,
    maxHeight: '90%',
    hourCellBasis: '22%',
    minuteCellBasis: '14%',
  },
  /** The tappable time under a reminder: at least this tall, as it holds two lines. */
  timeRow: 64,
  /** Scan photo thumbnails, in the photos' 3:4 shape. */
  thumbnail: { width: 48, height: 64 },
  skeletonLine: 14,
  /** Height of one segment of the onboarding progress bar. */
  progressSegment: 4,
  /** Height of the morning and evening progress bars on Home. */
  routineProgress: 6,
  /**
   * The tab bar's two big buttons: their least height (they grow with large
   * text), and the smallest their label shrinks to, as a fraction, before it
   * would be cut off at the largest text sizes. Their icons are a size up
   * from the small icons elsewhere, on a sturdier line.
   */
  tabBar: {
    button: 56,
    minLabelScale: 0.8,
    icon: 26,
    iconStroke: 2,
  },
  /**
   * The "Scan my skin" card at the top of Home: the width of its sun mark,
   * and the round camera badge at its end.
   */
  scanCard: {
    mark: 56,
    camera: 48,
  },
  /** Width of the last skeleton line, so the block reads as a paragraph. */
  skeletonShortLine: '60%',
} as const;

export const opacity = {
  disabled: 0.4,
  pressed: 0.7,
  skeletonLow: 0.4,
  skeletonHigh: 1,
} as const;

/** Layout of the capture screen. Oval values are fractions of the preview size. */
export const camera = {
  ovalWidth: 0.72,
  /** Oval height divided by its width. */
  ovalAspect: 1.32,
  /** Cap on the oval's height, for short screens. */
  ovalMaxHeight: 0.6,
  /** Vertical centre of the oval: a little above the middle, clear of the controls. */
  ovalCenterY: 0.42,
  ovalStroke: 3,
  shutter: 76,
  shutterRing: 4,
  /** Opacity of the previous scan photo shown over the preview. */
  ghostOpacity: 0.2,
} as const;

/**
 * The scanning sweep over the photo while a scan is analysed. A fixed colour:
 * it sits on a photo, which looks the same in light and dark mode.
 */
export const scanSweep = {
  color: scanSweepColor,
  /** Height of the moving band, as a fraction of the photo's height. */
  band: 0.35,
  /** Opacity at the band's centre. It fades to nothing at both edges. */
  peakOpacity: 0.35,
} as const;

/**
 * The progress trend chart. One series, in its card's tint: a 3dp line, 5dp
 * points with a 2dp ring in the card colour, hairline gridlines, and the
 * noise band as a faint wash of the same hue.
 */
export const chart = {
  /** Height of the plot, not counting the date labels below it. */
  height: 180,
  /** Room below the plot for the date labels. */
  axisBand: 24,
  /** Room left of the plot for the 0 / 50 / 100 labels. */
  yLabelWidth: 32,
  /** Space inside the plot edges, so edge points and their rings aren't cut off. */
  inset: 10,
  lineWidth: 3,
  pointRadius: 5,
  selectedRadius: 7,
  pointRing: 2,
  bandOpacity: 0.14,
  /** The gridlines drawn and labelled. */
  gridScores: [0, 50, 100],
} as const;

/**
 * The before-and-after slider. Its handle and labels sit on photos, so they
 * use the fixed over-photo colours (`cameraColors`), not the theme.
 */
export const compareSlider = {
  divider: 2,
  handle: 44,
  handleBorder: 2,
} as const;

/**
 * The shareable result card. A fixed look that doesn't follow light or dark
 * mode, so every shared image looks the same: high contrast, large type and
 * no hairlines. Its colours are `shareCardColors`, in colors.ts. Sizes are in
 * card units. The card is `width` units wide and scales to whatever width
 * it's drawn at, so the exported image stays sharp.
 */
export const shareCard = {
  colors: shareCardColors,
  width: 360,
  /** Width of the on-screen preview, in dp. */
  previewWidth: 200,
  padding: 28,
  /** Space between the groups in the middle of the card. */
  gap: { story: 28, feed: 18 },
  /** Ring diameter: alone, or beside the photo. */
  ring: { story: 220, feed: 150, besidePhoto: 130 },
  ringStroke: 16,
  /** The score and its label inside the ring, as fractions of the ring's diameter. */
  ringNumber: 0.3,
  ringLabel: 0.085,
  photo: { width: 130, height: 162, radius: 24 },
  tileRadius: 20,
  tilePadding: 12,
  tileGap: 10,
  heroGap: 16,
  /** Width of the sun mark beside the app name. */
  brandIcon: 30,
  brandGap: 8,
  /** Text sizes, with line height as a multiple of the size. */
  type: {
    brand: 20,
    date: 14,
    change: 26,
    changeNote: 16,
    tileValue: 28,
    tileLabel: 14,
    footer: 11,
  },
  lineHeight: 1.25,
  /** The before-and-after card (story size), on the same colours and type. */
  compare: {
    photo: { width: 140, height: 175 },
    photoGap: 16,
    type: { title: 26, overall: 40, value: 15, label: 13 },
    rowGap: 10,
    gap: 14,
  },
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

const SYSTEM_FONT = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

/**
 * Font families by weight. All system font for now. To adopt a custom font,
 * load it and replace these values — every text style below picks it up.
 */
export const fontFamilies = {
  regular: SYSTEM_FONT,
  medium: SYSTEM_FONT,
  semibold: SYSTEM_FONT,
  bold: SYSTEM_FONT,
} as const;

export type TypographyVariant =
  'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label' | 'labelLarge';

export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  /** Headings are drawn a touch tighter, which reads friendlier at bold weights. */
  letterSpacing?: number;
}

/** Bold, rounded-feeling headings over a plain, comfortable body size. */
export const typography: Record<TypographyVariant, TypographyStyle> = {
  display: {
    fontFamily: fontFamilies.bold,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: fontFamilies.bold,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  h2: {
    fontFamily: fontFamilies.bold,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  h3: { fontFamily: fontFamilies.bold, fontSize: 19, lineHeight: 26, fontWeight: '700' },
  body: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySmall: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 16, fontWeight: '400' },
  label: { fontFamily: fontFamilies.semibold, fontSize: 15, lineHeight: 20, fontWeight: '600' },
  /** Large buttons. */
  labelLarge: { fontFamily: fontFamilies.bold, fontSize: 17, lineHeight: 22, fontWeight: '700' },
};

/**
 * The most text grows with the phone's font size setting. Android's usual
 * "Largest" setting (about 1.3x) is honoured in full; beyond this, fixed-size
 * elements such as the score rings would overflow.
 */
export const maxFontScale = 1.5;

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

export type ShadowLevel = 'sm' | 'md' | 'lg';

export type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

/** A deep teal rather than black, so shadows under cards stay soft. */
const SHADOW_COLOR = '#0E3A35';

/** Android reads `elevation`; iOS reads the shadow* properties. Each level sets both. */
export const shadows: Record<ShadowLevel, ShadowStyle> = {
  sm: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  md: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

/**
 * Durations in milliseconds. Easing curves are cubic-bezier control points,
 * used as `Easing.bezier(...motion.easing.standard)` — the same call works
 * with Reanimated and with React Native's built-in Animated.
 */
export const motion = {
  duration: {
    fast: 150,
    base: 250,
    slow: 400,
    /** The score ring sweep and count-up. */
    reveal: 900,
    /** One half-cycle of the skeleton pulse. */
    pulse: 800,
    /** One pass of the scanning sweep over the photo. */
    sweep: 2400,
  },
  /**
   * The results reveal, in milliseconds from arrival. The overall ring sweeps
   * for `duration.reveal`; each later part fades and rises into place over
   * `fade`, starting at its own time. Everything has landed by about 2.3s.
   */
  results: {
    headlineAt: 900,
    attributesAt: 1100,
    /** Between one attribute and the next. */
    attributeStagger: 60,
    /** How long an attribute bar takes to fill. */
    attributeFill: 400,
    observationsAt: 1500,
    observationStagger: 120,
    focusAt: 1900,
    changeAt: 2000,
    fade: 300,
    /** How far, in dp, each part rises as it fades in. */
    rise: 12,
  },
  /** Scale applied to a button while pressed. */
  pressScale: 0.97,
  /**
   * The quick spring a tab bar button presses down and comes back up with,
   * as `Animated.spring` speed and bounciness: fast, with only a hint of
   * settle.
   */
  pressSpring: { speed: 40, bounciness: 4 },
  /**
   * Horizontal swipe between steps. A drag becomes a swipe once it travels
   * `activation` dp mostly sideways; it counts on release past `distance` dp
   * or faster than `velocity` dp/ms.
   */
  swipe: {
    activation: 12,
    distance: 60,
    velocity: 0.35,
  },
  easing: {
    /** Most on-screen movement: quick start, gentle settle. */
    standard: [0.2, 0, 0, 1],
    /** Elements arriving on screen. */
    decelerate: [0, 0, 0, 1],
    /** Elements leaving the screen. */
    accelerate: [0.3, 0, 1, 1],
  },
} as const;
