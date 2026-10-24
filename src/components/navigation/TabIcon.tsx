import type { ColorValue } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { sizes } from '@/theme/tokens';

export type TabIconName = 'home' | 'progress';

export interface TabIconProps {
  name: TabIconName;
  /** The open tab's icon is solid; the other is outlined at the same size, so the two line up. */
  focused: boolean;
  color: ColorValue;
  size?: number;
}

/**
 * The tab bar's icons, drawn on a 24-unit grid with soft, rounded corners and
 * a sturdier line than the small icons elsewhere. Each has a solid form for
 * the open tab and an outlined one for the other, with the same outline, so
 * nothing shifts when the tab changes. Their details (the door, the bars)
 * are cut out of the solid form, so they always show the button behind them.
 * Decorative: the label beside each carries the meaning.
 */
export function TabIcon({ name, focused, color, size = sizes.tabBar.icon }: TabIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {name === 'home' ? (
        focused ? (
          // Outlined in its own colour too, so its edge sits exactly where the outlined form's does.
          <Path d={SOLID_HOUSE} {...outline(color)} fill={color} />
        ) : (
          <Path d={HOUSE} {...outline(color)} />
        )
      ) : focused ? (
        <Path d={`${SOLID_PANEL}${BARS}`} fill={color} fillRule="evenodd" />
      ) : (
        <>
          <Rect x={4} y={4} width={16} height={16} rx={PANEL_RADIUS} {...outline(color)} />
          <Path d={BAR_LINES} {...outline(color)} />
        </>
      )}
    </Svg>
  );
}

function outline(color: ColorValue) {
  return {
    fill: 'none',
    stroke: color,
    strokeWidth: sizes.tabBar.iconStroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;
}

/** A house with a rounded roof and corners, and its door as a notch in the bottom edge. */
const HOUSE =
  'M4 10.2a2 2 0 0 1 .76-1.57l6-4.72a2 2 0 0 1 2.48 0l6 4.72A2 2 0 0 1 20 10.2V18a2 2 0 0 1-2 2h-3.5v-5a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v5H6a2 2 0 0 1-2-2z';
/** The same house with a wider door, as the outline drawn around the solid one narrows it. */
const SOLID_HOUSE =
  'M4 10.2a2 2 0 0 1 .76-1.57l6-4.72a2 2 0 0 1 2.48 0l6 4.72A2 2 0 0 1 20 10.2V18a2 2 0 0 1-2 2h-3v-4.5a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 15.5V20H6a2 2 0 0 1-2-2z';

/** A rounded square, and three rising bars inside it. */
const PANEL_RADIUS = 4.5;
/** The square filled out to the outlined square's outer edge. */
const SOLID_PANEL =
  'M8.5 3h7A5.5 5.5 0 0 1 21 8.5v7a5.5 5.5 0 0 1-5.5 5.5h-7A5.5 5.5 0 0 1 3 15.5v-7A5.5 5.5 0 0 1 8.5 3z';
/** The bars as rounded holes, for the solid form. */
const BARS =
  'M7 13.5a1 1 0 0 1 2 0V16a1 1 0 0 1-2 0zM11 11a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0zM15 8.5a1 1 0 0 1 2 0V16a1 1 0 0 1-2 0z';
/** The same bars as lines with round ends, for the outlined form. */
const BAR_LINES = 'M8 16v-2.5M12 16v-5M16 16V8.5';
