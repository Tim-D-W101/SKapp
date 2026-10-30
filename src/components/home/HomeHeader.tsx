import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatLongDay, partOfDay } from '@/lib/dates';
import { radius, sizes, spacing, useColors } from '@/theme/tokens';

/**
 * The top of Home: today's date over a greeting for the time of day, and a
 * round profile button that opens Settings, where the account, the plan,
 * reminders and data live. The tab below already says this is Home, so the
 * header says what day it is instead.
 */
export function HomeHeader() {
  const palette = useColors();
  const now = new Date();

  return (
    <View style={styles.header}>
      <View style={styles.text}>
        <Text variant="label" color="textSecondary">
          {formatLongDay(now)}
        </Text>
        <Text variant="h1" accessibilityRole="header">
          {copy.home.greeting[partOfDay(now)]}
        </Text>
      </View>
      <Pressable
        onPress={() => router.push('/settings')}
        accessibilityRole="button"
        accessibilityLabel={copy.home.profile.label}
        accessibilityHint={copy.home.profile.hint}
        style={({ pressed }) => [
          styles.profile,
          {
            backgroundColor: pressed ? palette.accentSubtle : palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Icon name="user" size={sizes.icon.lg} color="accentText" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  profile: {
    width: sizes.minTouchTarget,
    height: sizes.minTouchTarget,
    borderRadius: radius.full,
    borderWidth: sizes.borderWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
