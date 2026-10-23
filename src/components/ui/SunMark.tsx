import { useColorScheme } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { sizes, sunMarkColors } from '@/theme/tokens';

export interface SunMarkProps {
  /** Width in dp. The height follows the artwork's proportions. */
  width?: number;
  /**
   * What it's drawn on. `light` gives the teal sun, `dark` the icon's cream
   * sun, and `accent` colours that suit the accent fill in either mode.
   * Defaults to the phone's light or dark setting; set it on a surface that
   * doesn't follow the theme, such as the share card.
   */
  on?: 'light' | 'dark' | 'accent';
}

/**
 * The app's mark, as on the launcher icon: a sun rising over a gentle arc,
 * in the icon's own colours. The geometry matches assets/source/icon.svg
 * (same 1024-unit grid), cropped to the artwork. Decorative and hidden from
 * screen readers: it always sits beside text that carries the meaning.
 */
export function SunMark({ width = sizes.sunMark.lg, on }: SunMarkProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const ink = on === 'accent' ? sunMarkColors.onAccent[scheme] : sunMarkColors[on ?? scheme];

  return (
    <Svg
      width={width}
      height={width / ASPECT}
      viewBox={VIEW_BOX}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path d={SUN} fill={ink.sun} />
      <Path
        d={UPPER_ARC}
        fill="none"
        stroke={ink.arcs}
        strokeWidth={ARC_STROKE}
        strokeLinecap="round"
      />
      <Path
        d={LOWER_ARC}
        fill="none"
        stroke={ink.arcs}
        strokeWidth={ARC_STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** The artwork's bounds on the icon's grid: the arcs' ends (with round caps) to the sun's top. */
const VIEW_BOX = '165 313.5 694 412.5';
const ASPECT = 694 / 412.5;
const ARC_STROKE = 54;

/**
 * The sun, cut off below by a clear gap above the upper arc: the part of a
 * 250-unit circle outside the 1357-unit circle the icon masks it with.
 */
const SUN = 'M262.38 549.65A250 250 0 0 1 761.62 549.65A1357 1357 0 0 0 262.38 549.65Z';
const UPPER_ARC = 'M192 623.5A1300 1300 0 0 1 832 623.5';
const LOWER_ARC = 'M312 699A1300 1300 0 0 1 712 699';
