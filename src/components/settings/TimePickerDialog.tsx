import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Icon, SegmentedControl, Text, type SegmentedOption } from '@/components/ui';
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
  /**
   * Whether minutes can be picked as well as the hour. Off for a reminder
   * that is only ever on the hour, such as the weekly scan reminder.
   */
  withMinutes?: boolean;
  onCancel: () => void;
  onSave: (time: ReminderTime) => void;
}

type Period = 'am' | 'pm';

const HOURS_IN_HALF_DAY = 12;
const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = HOURS_IN_HALF_DAY * 2 * MINUTES_IN_HOUR;
const HALF_DAY_HOURS = Array.from({ length: HOURS_IN_HALF_DAY }, (_, index) => index);
const WHOLE_DAY_HOURS = Array.from({ length: HOURS_IN_HALF_DAY * 2 }, (_, index) => index);
/** The minutes listed to tap; the buttons beside the time reach the ones between. */
const MINUTE_STEP = 5;
const MINUTES = Array.from(
  { length: MINUTES_IN_HOUR / MINUTE_STEP },
  (_, index) => index * MINUTE_STEP,
);
/**
 * The least the large time and a minute's label shrink to, as a fraction,
 * to fit their space at the largest text sizes rather than be cut off.
 */
const MIN_LABEL_SCALE = 0.5;

const PERIODS: readonly SegmentedOption<Period>[] = [
  { value: 'am', label: copy.time.am },
  { value: 'pm', label: copy.time.pm },
];

/**
 * Picks the time a reminder arrives at: any time of day. The chosen time
 * shows large at the top, between buttons that move it a minute earlier or
 * later. Under it are the hours to tap (an AM / PM switch and twelve hours
 * on a phone that uses a 12-hour clock, or all twenty-four on one that
 * doesn't), then the minutes in fives. Nothing changes until Save. Mount it
 * while it's open: each opening starts from the reminder's current time.
 */
export function TimePickerDialog({
  title,
  time,
  withMinutes = true,
  onCancel,
  onSave,
}: TimePickerDialogProps) {
  const palette = useColors();
  const reduceMotion = useReduceMotion();
  // Minutes since midnight, so a minute either way can roll over into the next hour.
  const [draft, setDraft] = useState(time.hour * MINUTES_IN_HOUR + (withMinutes ? time.minute : 0));
  const hour = Math.floor(draft / MINUTES_IN_HOUR);
  const minute = draft % MINUTES_IN_HOUR;
  const twentyFourHour = usesTwentyFourHourClock();
  const period: Period = hour < HOURS_IN_HALF_DAY ? 'am' : 'pm';
  const hours = twentyFourHour
    ? WHOLE_DAY_HOURS
    : HALF_DAY_HOURS.map((offset) => offset + (period === 'pm' ? HOURS_IN_HALF_DAY : 0));

  const choose = (nextHour: number, nextMinute: number) => {
    hapticSelection();
    setDraft(nextHour * MINUTES_IN_HOUR + nextMinute);
  };

  const choosePeriod = (next: Period) =>
    setDraft(
      (current) =>
        (current % (HOURS_IN_HALF_DAY * MINUTES_IN_HOUR)) +
        (next === 'pm' ? HOURS_IN_HALF_DAY * MINUTES_IN_HOUR : 0),
    );

  const nudge = (by: number) => {
    hapticSelection();
    setDraft((current) => (current + by + MINUTES_IN_DAY) % MINUTES_IN_DAY);
  };

  // Soft cells in the screen's colour, no outlines, so a grid of 24 stays calm; the chosen one is filled.
  const cellColors = (selected: boolean, pressed: boolean) => ({
    backgroundColor: selected
      ? palette.accent
      : pressed
        ? palette.accentSubtle
        : palette.background,
  });

  const nudgeButton = (by: number) => (
    <Pressable
      onPress={() => nudge(by)}
      accessibilityRole="button"
      accessibilityLabel={
        by < 0
          ? copy.settings.reminders.timePicker.earlier
          : copy.settings.reminders.timePicker.later
      }
      style={({ pressed }) => [styles.nudge, cellColors(false, pressed)]}
    >
      <Icon name={by < 0 ? 'minus' : 'plus'} size={sizes.icon.lg} color="accentText" />
    </Pressable>
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
            <View style={styles.timeRow}>
              {withMinutes ? nudgeButton(-1) : null}
              <Text
                variant="display"
                color="accentText"
                align="center"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={MIN_LABEL_SCALE}
                accessibilityLiveRegion="polite"
                style={styles.time}
              >
                {formatTime(hour, minute)}
              </Text>
              {withMinutes ? nudgeButton(1) : null}
            </View>

            {twentyFourHour ? null : (
              <SegmentedControl
                options={PERIODS}
                value={period}
                onChange={choosePeriod}
                accessibilityLabel={copy.settings.reminders.timePicker.period}
              />
            )}

            <Text variant="label" color="textSecondary">
              {copy.settings.reminders.timePicker.hours}
            </Text>
            <View
              style={styles.grid}
              accessibilityRole="radiogroup"
              accessibilityLabel={copy.settings.reminders.timePicker.hours}
            >
              {hours.map((value) => {
                const selected = value === hour;
                return (
                  <Pressable
                    key={value}
                    onPress={() => choose(value, minute)}
                    accessibilityRole="radio"
                    accessibilityLabel={formatTime(value, minute)}
                    accessibilityState={{ checked: selected }}
                    style={({ pressed }) => [
                      styles.cell,
                      styles.hourCell,
                      cellColors(selected, pressed),
                    ]}
                  >
                    <Text variant="label" color={selected ? 'textInverse' : 'textPrimary'}>
                      {twentyFourHour ? formatTime(value) : copy.time.clockHour(value)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {withMinutes ? (
              <>
                <Text variant="label" color="textSecondary">
                  {copy.settings.reminders.timePicker.minutes}
                </Text>
                <View
                  style={styles.grid}
                  accessibilityRole="radiogroup"
                  accessibilityLabel={copy.settings.reminders.timePicker.minutes}
                >
                  {MINUTES.map((value) => {
                    const selected = value === minute;
                    return (
                      <Pressable
                        key={value}
                        onPress={() => choose(hour, value)}
                        accessibilityRole="radio"
                        accessibilityLabel={formatTime(hour, value)}
                        accessibilityState={{ checked: selected }}
                        style={({ pressed }) => [
                          styles.cell,
                          styles.minuteCell,
                          cellColors(selected, pressed),
                        ]}
                      >
                        <Text
                          variant="label"
                          color={selected ? 'textInverse' : 'textPrimary'}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={MIN_LABEL_SCALE}
                        >
                          {copy.time.minute(value)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
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
  time: {
    flex: 1,
  },
  nudge: {
    width: sizes.minTouchTarget,
    height: sizes.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
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
    borderRadius: radius.md,
  },
  /** Four to a row: each a little under a quarter, growing to fill it beside the gaps. */
  hourCell: {
    flexBasis: sizes.dialog.hourCellBasis,
  },
  /** Six to a row, the same way. */
  minuteCell: {
    flexBasis: sizes.dialog.minuteCellBasis,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
