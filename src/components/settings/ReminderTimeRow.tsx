import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconBadge, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatTime } from '@/lib/dates';
import type { ReminderTime } from '@/lib/reminderPlan';
import { radius, sizes, spacing, useColors } from '@/theme/tokens';

import { TimePickerDialog } from './TimePickerDialog';

export interface ReminderTimeRowProps {
  /** The row's small label, such as "Time". */
  label: string;
  /** The time picker's title: which reminder this is. */
  pickerTitle: string;
  /** The reminder's local time. */
  time: ReminderTime;
  onChange: (time: ReminderTime) => void;
}

/**
 * A reminder's time, large and easy to read, with a "Change" pill beside it
 * (as on Home's reminders card) so it's plain that it can be changed.
 * Tapping anywhere on it opens the time picker; the new time is passed on
 * only when it's saved there.
 */
export function ReminderTimeRow({ label, pickerTitle, time, onChange }: ReminderTimeRowProps) {
  const palette = useColors();
  const [picking, setPicking] = useState(false);
  const shown = formatTime(time.hour, time.minute);

  return (
    <>
      <Pressable
        onPress={() => setPicking(true)}
        accessibilityRole="button"
        accessibilityLabel={copy.settings.reminders.timeLabel(label, shown)}
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
          <Text variant="h2">{shown}</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: palette.surfaceMuted }]}>
          <Text variant="label" color="accentText">
            {copy.settings.reminders.change}
          </Text>
        </View>
      </Pressable>

      {picking ? (
        <TimePickerDialog
          title={pickerTitle}
          time={time}
          onCancel={() => setPicking(false)}
          onSave={(next) => {
            setPicking(false);
            if (next.hour !== time.hour || next.minute !== time.minute) onChange(next);
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
    borderRadius: radius.lg,
    borderWidth: sizes.borderWidth,
  },
  text: {
    flex: 1,
  },
  /** Not a button of its own: the whole row is. It only says what a tap does. */
  pill: {
    justifyContent: 'center',
    minHeight: sizes.control.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
});
