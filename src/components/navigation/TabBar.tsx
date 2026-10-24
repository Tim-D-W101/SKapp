import type { BottomTabBarProps } from 'expo-router/tabs';
import { useState, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { hapticImpact } from '@/lib/haptics';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { layout, motion, radius, sizes, spacing, useColors } from '@/theme/tokens';

/**
 * The tab bar: two big rounded buttons side by side, one per route, each an
 * icon beside a label. The open tab's button is filled in the brand teal,
 * with a solid icon; the other is a quiet button with a hairline outline and
 * an outlined icon. Scanning starts from Home, not from here.
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
          backgroundColor: palette.background,
          borderTopColor: palette.borderSubtle,
          paddingLeft: layout.gutter + insets.left,
          paddingRight: layout.gutter + insets.right,
          paddingBottom: spacing.sm + insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title;

        const onPress = () => {
          hapticImpact();
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TabButton
            key={route.key}
            label={label ?? route.name}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            focused={focused}
            icon={options.tabBarIcon?.({
              focused,
              color: focused ? palette.textInverse : palette.accentText,
              size: sizes.tabBar.icon,
            })}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
          />
        );
      })}
    </View>
  );
}

interface TabButtonProps {
  label: string;
  accessibilityLabel?: string;
  focused: boolean;
  icon: ReactNode;
  onPress: () => void;
  onLongPress: () => void;
}

/**
 * One tab, as a big button: filled teal when its tab is open, quiet
 * otherwise. While pressed it darkens a step and dips slightly on a quick
 * spring, unless the phone asks for less motion.
 */
function TabButton({
  label,
  accessibilityLabel,
  focused,
  icon,
  onPress,
  onLongPress,
}: TabButtonProps) {
  const palette = useColors();
  const reduceMotion = useReduceMotion();
  const [scale] = useState(() => new Animated.Value(1));

  const springTo = (toValue: number) => {
    if (reduceMotion) return;
    Animated.spring(scale, {
      toValue,
      ...motion.pressSpring,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.slot, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => springTo(motion.pressScale)}
        onPressOut={() => springTo(1)}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={accessibilityLabel ?? label}
        style={({ pressed }) => {
          const fill = focused
            ? pressed
              ? palette.accentPressed
              : palette.accent
            : pressed
              ? palette.accentSubtle
              : palette.surface;
          return [
            styles.button,
            { backgroundColor: fill, borderColor: focused ? fill : palette.border },
          ];
        }}
      >
        {icon}
        <Text
          variant="labelLarge"
          color={focused ? 'textInverse' : 'accentText'}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={sizes.tabBar.minLabelScale}
          style={styles.label}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: sizes.borderWidth,
  },
  slot: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: sizes.tabBar.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    // Both buttons have the same border, so they stay the same size whichever is open.
    borderWidth: sizes.borderWidth,
  },
  label: {
    flexShrink: 1,
  },
});
