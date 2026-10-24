import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, IconBadge, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatHour } from '@/lib/dates';
import { radius, sizes, spacing, useColors } from '@/theme/tokens';

import { TimePickerDialog } from './TimePickerDialog';

export interface ReminderTimeRowProps {
  /** The row's small label, such as "Time". */
  label: string;
  /** The time picker's title: which reminder this is. */
  pickerTitle: string;
  /** The reminder's local hour (0-23). */
  hour: number;
  onChange: (hour: number) => void;
}

/**
 * A reminder's time, large and easy to read, with "Change" beside it so it's
 * plain that it can be changed. Tapping anywhere on it opens the time picker;
 * the new time is passed on only when it's saved there.
 */
export function ReminderTimeRow({ label, pickerTitle, hour, onChange }: ReminderTimeRowProps) {
  const palette = useColors();
  const [picking, setPicking] = useState(false);
  const time = formatHour(hour);

  return (
    <>
      <Pressable
        onPress={() => setPicking(true)}
        accessibilityRole="button"
        accessibilityLabel={copy.settings.reminders.timeLabel(label, time)}
        accessibilityHint={copy.settings.reminders.changeTimeHint}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: pressed ? palette.accentSubtle : palette.surfaceElevated,
            borderColor: palette.border,
          },
        ]}
      >
        <IconBadge name="clock" size="md" />
        <View style={styles.text}>
          <Text variant="caption" color="textSecondary">
            {label}
          </Text>
          <Text variant="h3">{time}</Text>
        </View>
        <Text variant="label" color="accentText">
          {copy.settings.reminders.change}
        </Text>
        <Icon name="chevronRight" size={sizes.icon.md} color="accentText" />
      </Pressable>

      {picking ? (
        <TimePickerDialog
          title={pickerTitle}
          hour={hour}
          onCancel={() => setPicking(false)}
          onSave={(next) => {
            setPicking(false);
            if (next !== hour) onChange(next);
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.timeRow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
  },
  text: {
    flex: 1,
  },
});
