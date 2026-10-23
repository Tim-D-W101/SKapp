import type { BottomTabBarProps } from 'expo-router/tabs';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { hapticSelection } from '@/lib/haptics';
import {
  fontFamilies,
  layout,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
  useColors,
} from '@/theme/tokens';

const { tabBar } = sizes;

/** Space above a tab's icon pill and below its label, inside the bar. */
const ITEM_PADDING =
  (tabBar.height - tabBar.indicator.height - spacing.xs - typography.caption.lineHeight) / 2;

/**
 * The tab bar: a plain bar along the bottom of the screen with one tab per
 * route, each an icon over a label. The open tab's icon sits on a pill and
 * its label turns teal and bolder. Scanning starts from Home, not from here.
 *
 * It sits in the layout below the screens, not over them, so nothing scrolls
 * behind it, and it pads itself clear of the phone's navigation bar or
 * gesture line.
 */
export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const palette = useColors();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          backgroundColor: palette.surfaceElevated,
          borderTopColor: palette.borderSubtle,
          paddingLeft: layout.gutter + insets.left,
          paddingRight: layout.gutter + insets.right,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
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
      })}
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
  bar: {
    flexDirection: 'row',
    borderTopWidth: sizes.borderWidth,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: tabBar.height,
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
});
