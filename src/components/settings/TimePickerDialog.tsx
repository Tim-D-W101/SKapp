import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, SegmentedControl, Text, type SegmentedOption } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatHour, usesTwentyFourHourClock } from '@/lib/dates';
import { hapticSelection } from '@/lib/haptics';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { cameraColors, layout, radius, shadows, sizes, spacing, useColors } from '@/theme/tokens';

export interface TimePickerDialogProps {
  /** Which reminder's time this is, such as "Morning routine reminder". */
  title: string;
  /** The current time, as a local hour (0-23). */
  hour: number;
  onCancel: () => void;
  onSave: (hour: number) => void;
}

type Period = 'am' | 'pm';

const HOURS_IN_HALF_DAY = 12;
const HALF_DAY_HOURS = Array.from({ length: HOURS_IN_HALF_DAY }, (_, index) => index);
const WHOLE_DAY_HOURS = Array.from({ length: HOURS_IN_HALF_DAY * 2 }, (_, index) => index);

const PERIODS: readonly SegmentedOption<Period>[] = [
  { value: 'am', label: copy.time.am },
  { value: 'pm', label: copy.time.pm },
];

/**
 * Picks the hour a reminder arrives at. The chosen time shows large at the
 * top; under it are the hours to tap: an AM / PM switch and twelve hours on
 * a phone that uses a 12-hour clock, or all twenty-four on one that doesn't.
 * Nothing changes until Save. Mount it while it's open: each opening starts
 * from the reminder's current time.
 */
export function TimePickerDialog({ title, hour, onCancel, onSave }: TimePickerDialogProps) {
  const palette = useColors();
  const reduceMotion = useReduceMotion();
  const [draft, setDraft] = useState(hour);
  const twentyFourHour = usesTwentyFourHourClock();
  const period: Period = draft < HOURS_IN_HALF_DAY ? 'am' : 'pm';
  const hours = twentyFourHour
    ? WHOLE_DAY_HOURS
    : HALF_DAY_HOURS.map((offset) => offset + (period === 'pm' ? HOURS_IN_HALF_DAY : 0));

  const choosePeriod = (next: Period) =>
    setDraft((current) => (current % HOURS_IN_HALF_DAY) + (next === 'pm' ? HOURS_IN_HALF_DAY : 0));

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
            <Text
              variant="display"
              color="accentText"
              align="center"
              accessibilityLiveRegion="polite"
            >
              {formatHour(draft)}
            </Text>

            {twentyFourHour ? null : (
              <SegmentedControl
                options={PERIODS}
                value={period}
                onChange={choosePeriod}
                accessibilityLabel={copy.settings.reminders.timePicker.period}
              />
            )}

            <View
              style={styles.grid}
              accessibilityRole="radiogroup"
              accessibilityLabel={copy.settings.reminders.timePicker.hours}
            >
              {hours.map((value) => {
                const selected = value === draft;
                return (
                  <Pressable
                    key={value}
                    onPress={() => {
                      hapticSelection();
                      setDraft(value);
                    }}
                    accessibilityRole="radio"
                    accessibilityLabel={formatHour(value)}
                    accessibilityState={{ checked: selected }}
                    style={({ pressed }) => [
                      styles.cell,
                      {
                        backgroundColor: selected
                          ? palette.accent
                          : pressed
                            ? palette.accentSubtle
                            : palette.surfaceElevated,
                        borderColor: selected ? palette.accent : palette.border,
                      },
                    ]}
                  >
                    <Text variant="label" color={selected ? 'textInverse' : 'textPrimary'}>
                      {twentyFourHour ? formatHour(value) : copy.time.clockHour(value)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <View style={styles.action}>
              <Button label={copy.common.cancel} onPress={onCancel} variant="secondary" fullWidth />
            </View>
            <View style={styles.action}>
              <Button label={copy.common.save} onPress={() => onSave(draft)} fullWidth />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  /** Four to a row: each a little under a quarter, growing to fill it beside the gaps. */
  cell: {
    flexBasis: sizes.dialog.hourCellBasis,
    flexGrow: 1,
    minHeight: sizes.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
