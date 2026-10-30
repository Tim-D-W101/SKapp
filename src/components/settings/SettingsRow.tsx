import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { opacity, radius, sizes, spacing, useColors } from '@/theme/tokens';

export interface SettingsRowProps {
  label: string;
  /** A line under the label saying what happens, such as what an export includes. */
  description?: string;
  onPress: () => void;
  /** `danger` for a way into something that deletes; its own screen asks to confirm. */
  tone?: 'default' | 'danger';
  /** Shows a spinner in place of the chevron and ignores presses. */
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
}

/**
 * One action in a Settings section, as a row rather than a big button: its
 * name, a line saying what it does, and a chevron. A section can hold
 * several without turning into a stack of outlined buttons.
 */
export function SettingsRow({
  label,
  description,
  onPress,
  tone = 'default',
  loading = false,
  disabled = false,
  accessibilityHint,
}: SettingsRowProps) {
  const palette = useColors();
  const inactive = disabled || loading;
  const ink = tone === 'danger' ? 'danger' : 'accentText';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint ?? description}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? palette.accentSubtle : 'transparent' },
        disabled ? styles.disabled : null,
      ]}
    >
      <View style={styles.text}>
        <Text variant="label" color={ink}>
          {label}
        </Text>
        {description ? (
          <Text variant="bodySmall" color="textSecondary">
            {description}
          </Text>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator color={palette[ink]} />
      ) : (
        <Icon name="chevronRight" size={sizes.icon.md} color={ink} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.minTouchTarget,
    paddingVertical: spacing.sm,
    // Reaches out to the card's edges while pressed, with the text staying in line.
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  disabled: {
    opacity: opacity.disabled,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
});
