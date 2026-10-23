import type { ReactNode } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { copy } from '@/constants/copy';
import type { ProductIllustration as ProductKind } from '@/lib/routineIllustration';
import { illustrationColors as ink, sizes, useColors } from '@/theme/tokens';

export interface ProductIllustrationProps {
  kind: ProductKind;
  size?: number;
  /**
   * Hides it from screen readers. Set it when the text beside it already
   * names the product, as a routine step's title does.
   */
  decorative?: boolean;
}

/**
 * A friendly drawing of a generic kind of product (a pump bottle, a tube, a
 * jar), so a routine step reads at a glance. No brands, no real packaging.
 * Drawn on a 64-unit grid over a soft tile that follows the theme; the
 * product itself keeps the same colours in light and dark mode.
 */
export function ProductIllustration({
  kind,
  size = sizes.productIllustration,
  decorative = false,
}: ProductIllustrationProps) {
  const palette = useColors();
  const label = copy.routine.illustrations[kind];

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : label}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
    >
      <Rect width={64} height={64} rx={18} fill={palette.accentSubtle} />
      {DRAWINGS[kind]}
    </Svg>
  );
}

/** The outline every shape shares. */
const line = {
  stroke: ink.outline,
  strokeWidth: 2,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
} as const;

/** A short stroke with no fill: label lines, rays, ridges. */
const stroke = (color: string, width = 2) =>
  ({ stroke: color, strokeWidth: width, strokeLinecap: 'round', fill: 'none' }) as const;

/** A soft white sheen down the left side of a bottle. */
function Sheen({ x, y, height }: { x: number; y: number; height: number }) {
  return <Rect x={x} y={y} width={3} height={height} rx={1.5} fill={ink.highlight} opacity={0.7} />;
}

const DRAWINGS: Record<ProductKind, ReactNode> = {
  // A flip-top bottle with a cotton pad leaning on it.
  makeupRemover: (
    <G>
      <Rect x={14} y={11} width={18} height={9} rx={3} fill={ink.primary} {...line} />
      <Rect x={12} y={19} width={22} height={37} rx={6} fill={ink.secondaryLight} {...line} />
      <Rect x={14} y={33} width={18} height={21} rx={4} fill={ink.secondary} />
      <Sheen x={16} y={23} height={12} />
      <Circle cx={44} cy={45} r={12} fill={ink.highlight} {...line} />
      <Circle
        cx={44}
        cy={45}
        r={7.5}
        fill="none"
        stroke={ink.secondaryDeep}
        strokeWidth={2}
        strokeDasharray="2 3"
      />
    </G>
  ),

  // A pump bottle, with a couple of bubbles of foam.
  cleanser: (
    <G>
      <Rect x={37} y={12} width={10} height={4} rx={2} fill={ink.primary} {...line} />
      <Rect x={24} y={10} width={16} height={6} rx={3} fill={ink.primary} {...line} />
      <Rect x={29} y={16} width={6} height={5} fill={ink.primaryDeep} {...line} />
      <Rect x={25} y={20} width={14} height={6} rx={2} fill={ink.primary} {...line} />
      <Rect x={19} y={25} width={26} height={32} rx={8} fill={ink.secondary} {...line} />
      <Rect x={24} y={34} width={16} height={14} rx={3} fill={ink.cream} />
      <Path d="M27 39H37M27 43H33" {...stroke(ink.secondaryDeep)} />
      <Sheen x={22} y={29} height={14} />
      <Circle cx={52} cy={26} r={3.5} fill={ink.cream} {...line} />
      <Circle cx={53} cy={34} r={2.5} fill={ink.cream} {...line} />
    </G>
  ),

  // A tall bottle with a screw cap, half full, and a drop.
  toner: (
    <G>
      <Rect x={24} y={9} width={14} height={9} rx={3} fill={ink.primaryDeep} {...line} />
      <Rect x={27} y={17} width={8} height={5} fill={ink.secondaryLight} {...line} />
      <Rect x={19} y={21} width={24} height={36} rx={7} fill={ink.secondaryLight} {...line} />
      <Path d="M21 35H41V50A5 5 0 0 1 36 55H26A5 5 0 0 1 21 50Z" fill={ink.secondary} />
      <Rect x={24} y={38} width={14} height={10} rx={2} fill={ink.cream} />
      <Path d="M27 43H35" {...stroke(ink.secondaryDeep)} />
      <Sheen x={22} y={24} height={10} />
      <Path
        d="M51 17C51 17 46 23 46 26.5A5 5 0 0 0 56 26.5C56 23 51 17 51 17Z"
        fill={ink.primary}
        {...line}
      />
    </G>
  ),

  // A dropper bottle: rubber bulb, collar, glass with the pipette inside.
  serum: (
    <G>
      <Rect x={27} y={6} width={10} height={13} rx={5} fill={ink.primary} {...line} />
      <Rect x={24} y={18} width={16} height={6} rx={2} fill={ink.primaryDeep} {...line} />
      <Rect x={21} y={23} width={22} height={34} rx={6} fill={ink.secondaryDeep} {...line} />
      <Path d="M32 24V47" {...stroke(ink.cream, 3)} />
      <Rect x={24} y={35} width={16} height={13} rx={3} fill={ink.cream} />
      <Path
        d="M32 37.5C32 37.5 29 41 29 43A3 3 0 0 0 35 43C35 41 32 37.5 32 37.5Z"
        fill={ink.primary}
      />
      <Sheen x={24} y={26} height={7} />
    </G>
  ),

  // A small squeeze tube with a slim cap and an eye on its label.
  eyeCream: (
    <G>
      <Rect x={20} y={9} width={24} height={6} rx={1.5} fill={ink.secondaryDeep} {...line} />
      <Path d="M24 10.5V13.5M29 10.5V13.5M35 10.5V13.5M40 10.5V13.5" {...stroke(ink.primaryDeep)} />
      <Path d="M21 15H43L39 45H25Z" fill={ink.cream} {...line} />
      <Path
        d="M25 29Q32 22 39 29Q32 36 25 29Z"
        fill={ink.secondaryLight}
        stroke={ink.primary}
        strokeWidth={2}
      />
      <Circle cx={32} cy={29} r={2.5} fill={ink.primary} />
      <Rect x={27} y={45} width={10} height={4} fill={ink.secondaryDeep} {...line} />
      <Path d="M28 49H36L34.5 58H29.5Z" fill={ink.primary} {...line} />
    </G>
  ),

  // An open jar of cream, its lid leaning behind.
  moisturiser: (
    <G>
      <Rect
        x={30}
        y={10}
        width={24}
        height={9}
        rx={3}
        fill={ink.primary}
        transform="rotate(14 42 14.5)"
        {...line}
      />
      <Path d="M17 29C18 20 26 17 32 17C38 17 46 20 47 29Z" fill={ink.cream} {...line} />
      <Path d="M29 21Q33 18 36 22" {...stroke(ink.outline)} />
      <Rect x={12} y={27} width={40} height={7} rx={3.5} fill={ink.primaryDeep} {...line} />
      <Rect x={14} y={33} width={36} height={22} rx={8} fill={ink.secondary} {...line} />
      <Rect x={14} y={40} width={36} height={8} fill={ink.secondaryLight} />
      <Rect x={14} y={33} width={36} height={22} rx={8} fill="none" {...line} />
    </G>
  ),

  // A round bottle of oil with a screw cap and a drop on its label.
  faceOil: (
    <G>
      <Rect x={26} y={8} width={12} height={9} rx={3} fill={ink.primaryDeep} {...line} />
      <Rect x={28.5} y={16} width={7} height={8} fill={ink.secondaryLight} {...line} />
      <Circle cx={32} cy={40} r={17} fill={ink.secondaryLight} {...line} />
      <Path d="M17.2 43A15 15 0 0 0 46.8 43Z" fill={ink.secondaryDeep} />
      <Path
        d="M32 31C32 31 27.5 36.5 27.5 39.5A4.5 4.5 0 0 0 36.5 39.5C36.5 36.5 32 31 32 31Z"
        fill={ink.primary}
        {...line}
      />
      <Path d="M20 34A13 13 0 0 1 25 27" {...stroke(ink.highlight, 3)} />
    </G>
  ),

  // A lip balm stick, its rounded balm wound up out of the case.
  lipBalm: (
    <G>
      <Path d="M25 30V18A7 7 0 0 1 39 18V30Z" fill={ink.secondary} {...line} />
      <Path d="M28.5 17A3.5 3.5 0 0 1 31 14" {...stroke(ink.highlight, 2.5)} />
      <Rect x={22} y={29} width={20} height={7} rx={2} fill={ink.primaryDeep} {...line} />
      <Rect x={23} y={35} width={18} height={23} rx={4} fill={ink.primary} {...line} />
      <Path d="M28 43H36M28 48H36" {...stroke(ink.secondaryLight)} />
    </G>
  ),

  // A sunscreen tube, cap down, with a sun on the front.
  sunscreen: (
    <G>
      <Rect x={16} y={7} width={32} height={6} rx={1.5} fill={ink.secondaryDeep} {...line} />
      <Path
        d="M21 8.5V11.5M26.5 8.5V11.5M32 8.5V11.5M37.5 8.5V11.5M43 8.5V11.5"
        {...stroke(ink.primaryDeep)}
      />
      <Path d="M17 13H47L42 44H22Z" fill={ink.cream} {...line} />
      <Circle cx={32} cy={27} r={5} fill={ink.primary} />
      <Path
        d="M32 18.5V20M32 34V35.5M23.5 27H25M39 27H40.5M26 21L27 22M37 32L38 33M38 21L37 22M27 32L26 33"
        {...stroke(ink.primary)}
      />
      <Rect x={22} y={43} width={20} height={14} rx={3} fill={ink.primary} {...line} />
      <Path d="M26 50H38" {...stroke(ink.primaryDeep)} />
    </G>
  ),

  // A plain bottle with a heart on it, for any step without its own drawing.
  generic: (
    <G>
      <Rect x={25} y={10} width={14} height={9} rx={4} fill={ink.primary} {...line} />
      <Rect x={18} y={18} width={28} height={39} rx={10} fill={ink.secondary} {...line} />
      <Path
        d="M32 45C32 45 24.5 40 24.5 35.5A4 4 0 0 1 32 33.5A4 4 0 0 1 39.5 35.5C39.5 40 32 45 32 45Z"
        fill={ink.primary}
      />
      <Sheen x={21.5} y={23} height={12} />
    </G>
  ),
};
