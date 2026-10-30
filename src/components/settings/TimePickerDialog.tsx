import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatTime, usesTwentyFourHourClock } from '@/lib/dates';
import { hapticSelection } from '@/lib/haptics';
import type { ReminderTime } from '@/lib/reminderPlan';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { cameraColors, layout, radius, shadows, sizes, spacing, useColors } from '@/theme/tokens';

export interface TimePickerDialogProps {
  /** Which reminder's time this is, such as "Morning routine reminder". */
  title: string;
  /** The current time, in local time. */
  time: ReminderTime;
  onCancel: () => void;
  onSave: (time: ReminderTime) => void;
}

type Period = 'am' | 'pm';
type Field = 'hour' | 'minute';

const HOURS_IN_HALF_DAY = 12;
const MINUTES_IN_HOUR = 60;
const MINUTES_IN_HALF_DAY = HOURS_IN_HALF_DAY * MINUTES_IN_HOUR;
const MINUTES_IN_DAY = MINUTES_IN_HALF_DAY * 2;
const HALF_DAY_HOURS = Array.from({ length: HOURS_IN_HALF_DAY }, (_, index) => index);
const WHOLE_DAY_HOURS = Array.from({ length: HOURS_IN_HALF_DAY * 2 }, (_, index) => index);
/** The minutes listed to tap; the buttons under them reach the ones between. */
const MINUTE_STEP = 5;
const MINUTES = Array.from(
  { length: MINUTES_IN_HOUR / MINUTE_STEP },
  (_, index) => index * MINUTE_STEP,
);
const PERIODS: readonly Period[] = ['am', 'pm'];
/**
 * The least the hour and minute shrink to, as a fraction, to fit their boxes
 * at the largest text sizes rather than be cut off.
 */
const MIN_LABEL_SCALE = 0.5;

/**
 * Picks the time a reminder arrives at: any time of day, one step at a time.
 * The time shows large at the top as an hour box and a minute box (with AM /
 * PM beside them on a phone that uses a 12-hour clock); the box being chosen
 * is highlighted, and only its choices show below, so there's one clear
 * thing to do at each step. It opens on the hours; picking one moves on to
 * the minutes, in fives, with a minute either way under them for the ones
 * between. Either box can be tapped to go back to it. Nothing changes until
 * Save. Mount it while it's open: each opening starts from the reminder's
 * current time.
 */
export function TimePickerDialog({ title, time, onCancel, onSave }: TimePickerDialogProps) {
  const palette = useColors();
  const reduceMotion = useReduceMotion();
  // Minutes since midnight, so a minute either way can roll over into the next hour.
  const [draft, setDraft] = useState(time.hour * MINUTES_IN_HOUR + time.minute);
  const [field, setField] = useState<Field>('hour');
  const hour = Math.floor(draft / MINUTES_IN_HOUR);
  const minute = draft % MINUTES_IN_HOUR;
  const twentyFourHour = usesTwentyFourHourClock();
  const period: Period = hour < HOURS_IN_HALF_DAY ? 'am' : 'pm';
  const hours = twentyFourHour
    ? WHOLE_DAY_HOURS
    : HALF_DAY_HOURS.map((offset) => offset + (period === 'pm' ? HOURS_IN_HALF_DAY : 0));
  const hourLabel = (value: number) =>
    twentyFourHour ? copy.time.clockHour24(value) : copy.time.clockHour(value);
  const picker = copy.settings.reminders.timePicker;

  const chooseHour = (next: number) => {
    hapticSelection();
    setDraft(next * MINUTES_IN_HOUR + minute);
    setField('minute');
  };

  const chooseMinute = (next: number) => {
    hapticSelection();
    setDraft(hour * MINUTES_IN_HOUR + next);
  };

  const choosePeriod = (next: Period) => {
    if (next === period) return;
    hapticSelection();
    setDraft(
      (current) => (current % MINUTES_IN_HALF_DAY) + (next === 'pm' ? MINUTES_IN_HALF_DAY : 0),
    );
  };

  const nudge = (by: number) => {
    setDraft((current) => (current + by + MINUTES_IN_DAY) % MINUTES_IN_DAY);
  };

  const cellColors = (selected: boolean, pressed: boolean) => ({
    backgroundColor: selected
      ? palette.accent
      : pressed
        ? palette.accentSubtle
        : palette.surfaceMuted,
  });

  const fieldBox = (which: Field, text: string, label: string, hint: string) => {
    const active = field === which;
    return (
      <Pressable
        onPress={() => setField(which)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={hint}
        accessibilityState={{ selected: active }}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: active || pressed ? palette.accentSubtle : palette.surfaceMuted,
            borderColor: active ? palette.accent : 'transparent',
          },
        ]}
      >
        <Text
          variant="display"
          color={active ? 'accentText' : 'textPrimary'}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={MIN_LABEL_SCALE}
        >
          {text}
        </Text>
      </Pressable>
    );
  };

  const grid = (
    options: readonly number[],
    selected: number,
    choose: (value: number) => void,
    label: (value: number) => string,
    spoken: (value: number) => string,
    across: 'four' | 'six',
  ) => (
    <View
      style={styles.grid}
      accessibilityRole="radiogroup"
      accessibilityLabel={field === 'hour' ? picker.hours : picker.minutes}
    >
      {options.map((value) => {
        const isSelected = value === selected;
        return (
          <Pressable
            key={value}
            onPress={() => choose(value)}
            accessibilityRole="radio"
            accessibilityLabel={spoken(value)}
            accessibilityState={{ checked: isSelected }}
            style={({ pressed }) => [
              styles.cell,
              { flexBasis: sizes.dialog.cellBasis[across] },
              cellColors(isSelected, pressed),
            ]}
          >
            <Text
              variant="label"
              color={isSelected ? 'textInverse' : 'textPrimary'}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={MIN_LABEL_SCALE}
            >
              {label(value)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Modal
      visible
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={onCancel}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={copy.common.cancel}
        />
        <View
          style={[styles.dialog, { backgroundColor: palette.surfaceElevated }, shadows.lg]}
          accessibilityViewIsModal
        >
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
            <Text variant="h3" accessibilityRole="header">
              {title}
            </Text>

            <View style={styles.timeRow} accessibilityLiveRegion="polite">
              {fieldBox(
                'hour',
                hourLabel(hour),
                picker.hourBox(formatTime(hour, minute)),
                picker.hourBoxHint,
              )}
              <Text variant="display" color="textSecondary">
                {copy.time.separator}
              </Text>
              {fieldBox(
                'minute',
                copy.time.minutes(minute),
                picker.minuteBox(formatTime(hour, minute)),
                picker.minuteBoxHint,
              )}
              {twentyFourHour ? null : (
                <View
                  style={styles.periods}
                  accessibilityRole="radiogroup"
                  accessibilityLabel={picker.period}
                >
                  {PERIODS.map((value) => {
                    const isSelected = value === period;
                    return (
                      <Pressable
                        key={value}
                        onPress={() => choosePeriod(value)}
                        accessibilityRole="radio"
                        accessibilityLabel={copy.time[value]}
                        accessibilityState={{ checked: isSelected }}
                        style={({ pressed }) => [styles.period, cellColors(isSelected, pressed)]}
                      >
                        <Text variant="label" color={isSelected ? 'textInverse' : 'textPrimary'}>
                          {copy.time[value]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            <Text variant="label" color="textSecondary">
              {field === 'hour' ? picker.hours : picker.minutes}
            </Text>

            {field === 'hour'
              ? grid(
                  hours,
                  hour,
                  chooseHour,
                  hourLabel,
                  (value) => formatTime(value, minute),
                  twentyFourHour ? 'six' : 'four',
                )
              : grid(
                  MINUTES,
                  minute,
                  chooseMinute,
                  copy.time.minutes,
                  (value) => formatTime(hour, value),
                  'four',
                )}

            {field === 'minute' ? (
              <View style={styles.nudges}>
                <Button
                  label={picker.oneMinute}
                  accessibilityLabel={picker.earlier}
                  leadingIcon="minus"
                  onPress={() => nudge(-1)}
                  variant="secondary"
                  size="sm"
                />
                <Button
                  label={picker.oneMinute}
                  accessibilityLabel={picker.later}
                  leadingIcon="plus"
                  onPress={() => nudge(1)}
                  variant="secondary"
                  size="sm"
                />
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <View style={styles.action}>
              <Button label={copy.common.cancel} onPress={onCancel} variant="secondary" fullWidth />
            </View>
            <View style={styles.action}>
              <Button label={copy.common.save} onPress={() => onSave({ hour, minute })} fullWidth />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.gutter,
    backgroundColor: cameraColors.scrim,
  },
  dialog: {
    width: '100%',
    maxWidth: sizes.dialog.maxWidth,
    maxHeight: sizes.dialog.maxHeight,
    gap: spacing.md,
    padding: layout.cardPadding,
    borderRadius: radius.xl,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  content: {
    gap: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
    height: sizes.dialog.timeField,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    // The same width chosen or not, so nothing shifts when the box changes.
    borderWidth: sizes.borderWidthStrong,
  },
  periods: {
    width: sizes.dialog.periodWidth,
    height: sizes.dialog.timeField,
    gap: spacing.xs,
  },
  period: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    flexGrow: 1,
    minHeight: sizes.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  nudges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
