import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { Button, SegmentedControl, Text, type SegmentedOption } from '@/components/ui';
import { copy } from '@/constants/copy';
import { ROUTINE_VISITS_BEFORE_OFFER } from '@/constants/reminders';
import { logInDevelopment } from '@/lib/errors';
import type { ReminderTime, RoutineReminderSlot } from '@/lib/reminderPlan';
import { useAuthStore } from '@/stores/useAuthStore';
import { useReminderStore, type WeeklyReminderChanges } from '@/stores/useReminderStore';
import { useRoutineStore } from '@/stores/useRoutineStore';
import { sizes, spacing, useColors } from '@/theme/tokens';
import type { RoutineSlot } from '@/types/routine';

import { ReminderTimeRow } from './ReminderTimeRow';
import { SwitchRow } from './SwitchRow';
import { TimePickerDialog } from './TimePickerDialog';

/** Monday first, in one even row: the short name shows, the full one is read out. */
const WEEKDAY_OPTIONS: readonly SegmentedOption<number>[] = copy.settings.reminders.weekdays.map(
  (day) => ({ value: day.value, label: day.short, accessibilityLabel: day.name }),
);

const ROUTINE_OPTIONS: readonly SegmentedOption<RoutineReminderSlot>[] = [
  { value: 'off', label: copy.settings.reminders.routineOptions.off },
  { value: 'morning', label: copy.settings.reminders.routineOptions.morning, icon: 'sun' },
  { value: 'evening', label: copy.settings.reminders.routineOptions.evening, icon: 'moon' },
];

/**
 * Every reminder control: a master switch, then each kind on its own,
 * separated by hairlines: the weekly reminder's day and time, the daily
 * routine reminder's morning or evening and its time, and the streak
 * reminder. Each time reads large and opens a time picker when tapped.
 * Choosing Morning or Evening opens the picker straight away, so the
 * reminder always comes at a time the person set; nothing changes until
 * Save. Changes reschedule at once. If notifications were refused, it
 * points to the phone's settings instead of asking again. Settings shows it
 * in its Reminders section, and Home in the sheet its reminders card opens;
 * whoever shows it gives it a title.
 */
export function ReminderControls() {
  const palette = useColors();
  const permission = useReminderStore((state) => state.permission);
  const settings = useReminderStore((state) => state.settings);
  const update = useReminderStore((state) => state.update);
  const updateWeekly = useReminderStore((state) => state.updateWeekly);
  const askPermission = useReminderStore((state) => state.askPermission);
  const profile = useAuthStore((state) => state.profile);
  const hasRoutine = useRoutineStore((state) => state.routine !== null);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  /** Morning or Evening, just chosen: its time picker is open, and nothing is saved until Save. */
  const [choosing, setChoosing] = useState<RoutineSlot | null>(null);

  const saveWeekly = async (changes: WeeklyReminderChanges) => {
    setError(null);
    const result = await updateWeekly(changes);
    if (!result.ok) setError(copy.settings.reminders.saveFailed);
  };

  const enable = async () => {
    setAsking(true);
    await askPermission();
    setAsking(false);
  };

  const openPhoneSettings = () => {
    Linking.openSettings().catch((openError: unknown) => {
      logInDevelopment('Could not open the phone settings', openError);
    });
  };

  if (permission === 'denied') {
    return (
      <View style={styles.controls}>
        <Text color="textSecondary">{copy.notifications.permission.deniedBody}</Text>
        <Button
          label={copy.settings.reminders.openSettings}
          onPress={openPhoneSettings}
          variant="secondary"
          fullWidth
        />
      </View>
    );
  }

  if (permission === 'undetermined') {
    return (
      <View style={styles.controls}>
        <Text color="textSecondary">{copy.notifications.permission.body}</Text>
        <Button
          label={copy.settings.reminders.enable}
          onPress={() => void enable()}
          loading={asking}
          fullWidth
        />
      </View>
    );
  }

  const weeklyOn = profile?.reminder_enabled ?? false;
  const weekday = profile?.reminder_weekday ?? 0;
  const hour = profile?.reminder_hour ?? 0;
  // Once there's a routine to be reminded of, or one is already set.
  const routineUnlocked =
    hasRoutine ||
    settings.routine !== 'off' ||
    settings.routineVisits >= ROUTINE_VISITS_BEFORE_OFFER;
  const routineSlot = settings.routine === 'off' ? null : settings.routine;
  const divider = <View style={[styles.divider, { backgroundColor: palette.borderSubtle }]} />;

  const chooseRoutine = (routine: RoutineReminderSlot) => {
    if (routine === settings.routine) return;
    if (routine === 'off') update({ routine });
    else setChoosing(routine);
  };

  const setRoutineTime = (slot: RoutineSlot, time: ReminderTime, routine = settings.routine) =>
    update({ routine, routineTimes: { ...settings.routineTimes, [slot]: time } });

  return (
    <View style={styles.controls}>
      <SwitchRow
        label={copy.settings.reminders.master}
        value={settings.enabled}
        onChange={(enabled) => update({ enabled })}
      />

      {settings.enabled ? (
        <>
          {divider}
          <View style={styles.group}>
            <SwitchRow
              label={copy.settings.reminders.weekly}
              hint={copy.settings.reminders.weeklyHint}
              value={weeklyOn}
              onChange={(enabled) => void saveWeekly({ reminder_enabled: enabled })}
            />
            {weeklyOn ? (
              <>
                <Text variant="label" color="textSecondary">
                  {copy.settings.reminders.day}
                </Text>
                <SegmentedControl
                  options={WEEKDAY_OPTIONS}
                  value={weekday}
                  onChange={(day) => void saveWeekly({ reminder_weekday: day })}
                  accessibilityLabel={copy.settings.reminders.day}
                />
                <ReminderTimeRow
                  label={copy.settings.reminders.time}
                  pickerTitle={copy.settings.reminders.weeklyTimeTitle}
                  time={{ hour, minute: settings.weeklyMinute }}
                  onChange={(next) => {
                    // The hour is the account's; the minute is kept on this phone.
                    if (next.minute !== settings.weeklyMinute)
                      update({ weeklyMinute: next.minute });
                    if (next.hour !== hour) void saveWeekly({ reminder_hour: next.hour });
                  }}
                />
              </>
            ) : null}
          </View>

          {divider}
          <View style={styles.group}>
            <Text>{copy.settings.reminders.routine}</Text>
            {routineUnlocked ? (
              <>
                <SegmentedControl
                  options={ROUTINE_OPTIONS}
                  value={settings.routine}
                  onChange={chooseRoutine}
                  accessibilityLabel={copy.settings.reminders.routine}
                />
                {routineSlot ? (
                  <ReminderTimeRow
                    label={copy.settings.reminders.time}
                    pickerTitle={copy.settings.reminders.routineTimeTitle[routineSlot]}
                    time={settings.routineTimes[routineSlot]}
                    onChange={(next) => setRoutineTime(routineSlot, next)}
                  />
                ) : null}
                {choosing ? (
                  <TimePickerDialog
                    title={copy.settings.reminders.routineTimeTitle[choosing]}
                    time={settings.routineTimes[choosing]}
                    onCancel={() => setChoosing(null)}
                    onSave={(next) => {
                      setChoosing(null);
                      setRoutineTime(choosing, next, choosing);
                    }}
                  />
                ) : null}
                <Text variant="caption" color="textSecondary">
                  {copy.settings.reminders.routineHint}
                </Text>
              </>
            ) : (
              <Text variant="bodySmall" color="textSecondary">
                {copy.settings.reminders.routineLocked}
              </Text>
            )}
          </View>

          {divider}
          <SwitchRow
            label={copy.settings.reminders.streak}
            hint={copy.settings.reminders.streakHint}
            value={settings.streak}
            onChange={(streak) => update({ streak })}
          />
          {divider}
        </>
      ) : null}

      <Text variant="caption" color="textSecondary">
        {copy.settings.reminders.oneADay}
      </Text>
      {error ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    gap: spacing.md,
  },
  group: {
    gap: spacing.sm,
  },
  divider: {
    height: sizes.borderWidth,
  },
});
