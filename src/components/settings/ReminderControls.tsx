import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { Button, SegmentedControl, Text, type SegmentedOption } from '@/components/ui';
import { copy } from '@/constants/copy';
import { ROUTINE_VISITS_BEFORE_OFFER } from '@/constants/reminders';
import { logInDevelopment } from '@/lib/errors';
import type { RoutineReminderSlot } from '@/lib/reminderPlan';
import { useAuthStore } from '@/stores/useAuthStore';
import { useReminderStore, type WeeklyReminderChanges } from '@/stores/useReminderStore';
import { sizes, spacing, useColors } from '@/theme/tokens';

import { ReminderTimeRow } from './ReminderTimeRow';
import { SwitchRow } from './SwitchRow';

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
 * Changes reschedule at once. If notifications were refused, it points to
 * the phone's settings instead of asking again. Settings shows it in its
 * Reminders section, and Home in the sheet its reminders card opens;
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
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

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
  const routineUnlocked = settings.routineVisits >= ROUTINE_VISITS_BEFORE_OFFER;
  const routineSlot = settings.routine === 'off' ? null : settings.routine;
  const divider = <View style={[styles.divider, { backgroundColor: palette.borderSubtle }]} />;

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
                  hour={hour}
                  onChange={(next) => void saveWeekly({ reminder_hour: next })}
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
                  onChange={(routine) => update({ routine })}
                  accessibilityLabel={copy.settings.reminders.routine}
                />
                {routineSlot ? (
                  <ReminderTimeRow
                    label={copy.settings.reminders.time}
                    pickerTitle={copy.settings.reminders.routineTimeTitle[routineSlot]}
                    hour={settings.routineHours[routineSlot]}
                    onChange={(next) =>
                      update({ routineHours: { ...settings.routineHours, [routineSlot]: next } })
                    }
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
