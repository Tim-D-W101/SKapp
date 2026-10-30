import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler, Linking, StyleSheet, View } from 'react-native';

import { ReminderTimeRow } from '@/components/settings/ReminderTimeRow';
import {
  Button,
  Card,
  IconBadge,
  Screen,
  SegmentedControl,
  Text,
  type SegmentedOption,
} from '@/components/ui';
import { copy } from '@/constants/copy';
import { EVENING_FROM_HOUR } from '@/constants/routine';
import { logInDevelopment } from '@/lib/errors';
import { useReminderStore } from '@/stores/useReminderStore';
import { spacing } from '@/theme/tokens';
import type { RoutineSlot } from '@/types/routine';

export interface DailyReminderOfferScreenProps {
  /** Where to go next, whichever the answer. */
  next: Href;
}

/** Asking; then picking the routine and the time; then, only if notifications were refused, saying so. */
type Stage = 'ask' | 'time' | 'denied';

const SLOT_OPTIONS: readonly SegmentedOption<RoutineSlot>[] = [
  { value: 'morning', label: copy.settings.reminders.routineOptions.morning, icon: 'sun' },
  { value: 'evening', label: copy.settings.reminders.routineOptions.evening, icon: 'moon' },
];

/**
 * "Do you want daily reminders?", after a scan's results, while no daily
 * routine reminder is set (see reminderOffer.ts). Yes leads straight to
 * choosing the morning or evening routine and the person's own time, picked
 * right there; Save schedules it, asking for notifications first if they
 * haven't been allowed yet. Not now (or Back) means it isn't asked again;
 * Settings and Home's reminders card can always set one later.
 */
export function DailyReminderOfferScreen({ next }: DailyReminderOfferScreenProps) {
  const permission = useReminderStore((state) => state.permission);
  const update = useReminderStore((state) => state.update);
  const askPermission = useReminderStore((state) => state.askPermission);
  const dismissAfterScanOffer = useReminderStore((state) => state.dismissAfterScanOffer);
  const [stage, setStage] = useState<Stage>('ask');
  // The routine of the time of day it is now, as the routine tab opens on.
  const [slot, setSlot] = useState<RoutineSlot>(() =>
    new Date().getHours() < EVENING_FROM_HOUR ? 'morning' : 'evening',
  );
  // Each routine's time as last set, or its starting suggestion, until Save.
  const [times, setTimes] = useState(() => useReminderStore.getState().settings.routineTimes);
  const [saving, setSaving] = useState(false);

  const leave = useCallback(() => router.dismissTo(next), [next]);

  const notNow = useCallback(() => {
    dismissAfterScanOffer();
    leave();
  }, [dismissAfterScanOffer, leave]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        // After a refusal there's nothing left to answer, so Back just carries on.
        if (stage === 'denied') leave();
        else notNow();
        return true;
      });
      return () => subscription.remove();
    }, [stage, leave, notNow]),
  );

  const save = async () => {
    setSaving(true);
    // Kept even if notifications are refused, so it's ready once they're allowed.
    const routineTimes = {
      ...useReminderStore.getState().settings.routineTimes,
      [slot]: times[slot],
    };
    update({ routine: slot, routineTimes });
    const allowed = permission === 'granted' || (await askPermission()) === 'granted';
    setSaving(false);
    if (allowed) leave();
    else setStage('denied');
  };

  const openPhoneSettings = () => {
    Linking.openSettings().catch((error: unknown) => {
      logInDevelopment('Could not open the phone settings', error);
    });
  };

  const offer = copy.notifications.dailyOffer;
  const text = {
    ask: { title: offer.title, body: offer.body },
    time: { title: offer.timeTitle, body: offer.timeBody },
    denied: { title: offer.deniedTitle, body: copy.notifications.permission.deniedBody },
  }[stage];

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.body}>
        <IconBadge
          name={stage === 'time' ? 'clock' : 'bell'}
          size="lg"
          tone="filled"
          tint="coral"
        />
        <Text variant="h2" align="center" accessibilityRole="header">
          {text.title}
        </Text>
        <Text color="textSecondary" align="center">
          {text.body}
        </Text>
        {stage === 'ask' ? (
          <Text variant="bodySmall" color="textSecondary" align="center">
            {offer.note}
          </Text>
        ) : null}
        {stage === 'time' ? (
          <Card style={styles.choice}>
            <SegmentedControl
              options={SLOT_OPTIONS}
              value={slot}
              onChange={setSlot}
              accessibilityLabel={offer.routine}
            />
            <ReminderTimeRow
              label={copy.settings.reminders.time}
              pickerTitle={copy.settings.reminders.routineTimeTitle[slot]}
              time={times[slot]}
              onChange={(time) => setTimes((current) => ({ ...current, [slot]: time }))}
            />
          </Card>
        ) : null}
      </View>

      <View style={styles.actions}>
        {stage === 'ask' ? (
          <>
            <Button label={offer.yes} onPress={() => setStage('time')} fullWidth size="lg" />
            <Button label={offer.notNow} onPress={notNow} variant="ghost" fullWidth />
          </>
        ) : null}
        {stage === 'time' ? (
          <>
            <Button
              label={offer.save}
              onPress={() => void save()}
              loading={saving}
              fullWidth
              size="lg"
            />
            <Button label={offer.notNow} onPress={notNow} variant="ghost" fullWidth />
          </>
        ) : null}
        {stage === 'denied' ? (
          <>
            <Button label={offer.continue} onPress={leave} fullWidth size="lg" />
            <Button
              label={copy.settings.reminders.openSettings}
              onPress={openPhoneSettings}
              variant="secondary"
              fullWidth
            />
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  body: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  choice: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
});
