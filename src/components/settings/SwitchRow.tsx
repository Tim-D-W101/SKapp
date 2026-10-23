import { StyleSheet, Switch, View } from 'react-native';

import { Text } from '@/components/ui';
import { sizes, spacing, useColors } from '@/theme/tokens';

export interface SwitchRowProps {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

/** A setting that is on or off: its label and a switch, with a short hint below. */
export function SwitchRow({ label, hint, value, onChange }: SwitchRowProps) {
  const palette = useColors();
  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onChange}
          accessibilityLabel={label}
          accessibilityHint={hint}
          trackColor={{ false: palette.border, true: palette.accent }}
          thumbColor={palette.surfaceElevated}
        />
      </View>
      {hint ? (
        <Text variant="caption" color="textSecondary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: sizes.minTouchTarget,
  },
  label: {
    flex: 1,
  },
});
