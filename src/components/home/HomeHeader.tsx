import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatLongDate } from '@/lib/dates';
import { radius, sizes, spacing, useColors } from '@/theme/tokens';

/**
 * The top of Home: a greeting for the time of day and today's date, where a
 * title would only repeat the open tab, and a round profile button that
 * opens Settings, where the account, the plan, reminders and data live.
 */
export function HomeHeader() {
  const palette = useColors();
  const now = new Date();

  return (
    <View style={styles.header}>
      <View style={styles.text}>
        <Text variant="h1" accessibilityRole="header">
          {copy.home.greeting(now.getHours())}
        </Text>
        <Text color="textSecondary">{formatLongDate(now)}</Text>
      </View>
      <Pressable
        onPress={() => router.push('/settings')}
        accessibilityRole="button"
        accessibilityLabel={copy.home.profile.label}
        accessibilityHint={copy.home.profile.hint}
        style={({ pressed }) => [
          styles.profile,
          { backgroundColor: pressed ? palette.accentSubtle : palette.surfaceMuted },
        ]}
      >
        <Icon name="user" size={sizes.icon.lg} color="textPrimary" />
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
  },
  profile: {
    width: sizes.minTouchTarget,
    height: sizes.minTouchTarget,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
