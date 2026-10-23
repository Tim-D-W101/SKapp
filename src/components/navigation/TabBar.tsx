import type { BottomTabBarProps } from 'expo-router/tabs';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SunMark, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { startScan } from '@/lib/access';
import { hapticImpact, hapticSelection } from '@/lib/haptics';
import {
  fontFamilies,
  layout,
  motion,
  opacity,
  radius,
  shadows,
  sizes,
  spacing,
  typography,
  useColors,
} from '@/theme/tokens';

const { tabBar } = sizes;

/** The scan button's full width, ring included. */
const SCAN_OUTER = tabBar.scanButton + tabBar.scanButtonRing * 2;

/** Space above a tab's icon pill and below its label, inside the bar. */
const ITEM_PADDING =
  (tabBar.height - tabBar.indicator.height - spacing.xs - typography.caption.lineHeight) / 2;

/**
 * How far the scan button rises above the bar. Its bottom lines up with the
 * bottom of the tabs' icon pills, so all three labels sit on one line.
 */
const SCAN_RISE = SCAN_OUTER - ITEM_PADDING - tabBar.indicator.height;

/**
 * The tab bar: a floating, rounded bar with the tabs either side of a large
 * round scan button. The scan button isn't a tab. It starts a scan the same
 * way every other scan button does, so once the free scan is used it opens
 * the plans instead.
 *
 * It sits in the layout below the screens, not over them, so nothing scrolls
 * behind it. Its top edge leaves room for the raised scan button, which stays
 * inside this view's bounds: Android only delivers taps that land inside a
 * view's parent.
 */
export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const palette = useColors();

  const tabs = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    const focused = state.index === index;
    const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        hapticSelection();
        navigation.navigate(route.name, route.params);
      }
    };

    return (
      <TabItem
        key={route.key}
        label={label ?? route.name}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        focused={focused}
        icon={options.tabBarIcon?.({
          focused,
          color: focused ? palette.accentText : palette.textSecondary,
          size: sizes.icon.lg,
        })}
        onPress={onPress}
        onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
      />
    );
  });

  // The scan button goes in the middle, between the first half of the tabs and the rest.
  const half = Math.ceil(tabs.length / 2);

  const scan = () => {
    hapticImpact();
    startScan();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingLeft: layout.gutter + insets.left,
          paddingRight: layout.gutter + insets.right,
          paddingBottom: insets.bottom + spacing.sm,
        },
      ]}
    >
      <View
        accessibilityRole="tablist"
        style={[
          styles.bar,
          { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle },
          shadows.md,
        ]}
      >
        {tabs.slice(0, half)}
        {/* The label under the scan button. Tapping it scans too; screen readers get the button. */}
        <Pressable
          onPress={scan}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.scanColumn}
        >
          <View style={styles.indicator} />
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {copy.tabs.scan}
          </Text>
        </Pressable>
        {tabs.slice(half)}
      </View>

      {/* After the bar and higher up on Android's elevation, so it's drawn over the bar's edge. */}
      <Pressable
        onPress={scan}
        accessibilityRole="button"
        accessibilityLabel={copy.tabs.scanLabel}
        accessibilityHint={copy.tabs.scanHint}
        style={({ pressed }) => [
          styles.scanButton,
          {
            backgroundColor: pressed ? palette.accentPressed : palette.accent,
            borderColor: palette.background,
            transform: [{ scale: pressed ? motion.pressScale : 1 }],
          },
          shadows.lg,
        ]}
      >
        <SunMark width={tabBar.scanButtonMark} on="accent" />
      </Pressable>
    </View>
  );
}

interface TabItemProps {
  label: string;
  accessibilityLabel?: string;
  focused: boolean;
  icon: ReactNode;
  onPress: () => void;
  onLongPress: () => void;
}

/** One tab: its icon on a pill that fills in when the tab is open, and its label. */
function TabItem({ label, accessibilityLabel, focused, icon, onPress, onLongPress }: TabItemProps) {
  const palette = useColors();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.item, pressed && !focused ? styles.pressed : null]}
    >
      <View
        style={[
          styles.indicator,
          { backgroundColor: focused ? palette.accentSubtle : 'transparent' },
        ]}
      >
        {icon}
      </View>
      <Text
        variant="caption"
        color={focused ? 'accentText' : 'textSecondary'}
        numberOfLines={1}
        style={focused ? styles.activeLabel : null}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: SCAN_RISE,
  },
  bar: {
    flexDirection: 'row',
    minHeight: tabBar.height,
    borderRadius: radius.xl,
    borderWidth: sizes.borderWidth,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: ITEM_PADDING,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  indicator: {
    width: tabBar.indicator.width,
    height: tabBar.indicator.height,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontFamily: fontFamilies.semibold,
    fontWeight: typography.label.fontWeight,
  },
  scanColumn: {
    width: SCAN_OUTER,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: ITEM_PADDING,
  },
  scanButton: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -SCAN_OUTER / 2,
    width: SCAN_OUTER,
    height: SCAN_OUTER,
    borderRadius: radius.full,
    borderWidth: tabBar.scanButtonRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
