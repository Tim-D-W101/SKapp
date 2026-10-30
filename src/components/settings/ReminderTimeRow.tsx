import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatTime } from '@/lib/dates';
import type { ReminderTime } from '@/lib/reminderPlan';
import { opacity, radius, sizes, spacing, useColors } from '@/theme/tokens';

import { TimePickerDialog } from './TimePickerDialog';

export interface ReminderTimeRowProps {
  /** The row's label, such as "Time". */
  label: string;
  /** The time picker's title: which reminder this is. */
  pickerTitle: string;
  /** The reminder's local time. */
  time: ReminderTime;
  /** Whether the picker offers minutes too. Off for a reminder that is only ever on the hour. */
  withMinutes?: boolean;
  onChange: (time: ReminderTime) => void;
}

/**
 * A reminder's time: its label, and the time itself large on a coral pill
 * (the reminders' colour) between a coral clock and chevron, so it's plain
 * that it can be changed. Tapping anywhere on the row opens the time picker;
 * the new time is passed on only when it's saved there.
 */
export function ReminderTimeRow({
  label,
  pickerTitle,
  time,
  withMinutes = true,
  onChange,
}: ReminderTimeRowProps) {
  const palette = useColors();
  const tint = palette.tints.coral;
  const [picking, setPicking] = useState(false);
  const shown = formatTime(time.hour, time.minute);

  return (
    <>
      <Pressable
        onPress={() => setPicking(true)}
        accessibilityRole="button"
        accessibilityLabel={copy.settings.reminders.timeLabel(label, shown)}
        accessibilityHint={copy.settings.reminders.changeTimeHint}
        style={styles.row}
      >
        {({ pressed }) => (
          <>
            <Text style={styles.label}>{label}</Text>
            <View
              style={[styles.pill, { backgroundColor: tint.soft }, pressed ? styles.pressed : null]}
            >
              <Icon name="clock" size={sizes.icon.md} tint={tint.text} />
              <Text variant="h3">{shown}</Text>
              <Icon name="chevronRight" size={sizes.icon.sm} tint={tint.text} />
            </View>
          </>
        )}
      </Pressable>

      {picking ? (
        <TimePickerDialog
          title={pickerTitle}
          time={time}
          withMinutes={withMinutes}
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
    minHeight: sizes.minTouchTarget,
  },
  label: {
    flex: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.minTouchTarget,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: radius.full,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
