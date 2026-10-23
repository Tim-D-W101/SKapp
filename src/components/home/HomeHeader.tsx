import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, SunMark, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { radius, sizes, spacing, useColors } from '@/theme/tokens';

/**
 * The top of Home: the mark and title, and a round profile button that opens
 * Settings, where the account, the plan, reminders and data live.
 */
export function HomeHeader() {
  const palette = useColors();

  return (
    <View style={styles.header}>
      <SunMark width={sizes.sunMark.sm} />
      <Text variant="h1" accessibilityRole="header" style={styles.title}>
        {copy.home.title}
      </Text>
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
    gap: spacing.sm,
  },
  title: {
    flex: 1,
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
