import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TimePickerDialog } from '@/components/settings/TimePickerDialog';
import { Button, Card, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { ROUTINE_VISITS_BEFORE_OFFER } from '@/constants/reminders';
import type { ReminderTime } from '@/lib/reminderPlan';
import { useReminderStore } from '@/stores/useReminderStore';
import { spacing } from '@/theme/tokens';
import type { RoutineSlot } from '@/types/routine';

/**
 * Offers a daily routine reminder, once someone has used the routine a
 * couple of times. Mornings or Evenings opens the time picker, so the
 * reminder comes at the time they pick. Off unless chosen here or in
 * Settings. Hidden once answered, or if notifications were refused.
 */
export function RoutineReminderOffer() {
  const loaded = useReminderStore((state) => state.loaded);
  const permission = useReminderStore((state) => state.permission);
  const settings = useReminderStore((state) => state.settings);
  const update = useReminderStore((state) => state.update);
  const askPermission = useReminderStore((state) => state.askPermission);
  const dismissRoutineOffer = useReminderStore((state) => state.dismissRoutineOffer);
  /** Mornings or Evenings, just chosen: its time picker is open. */
  const [choosing, setChoosing] = useState<RoutineSlot | null>(null);

  const visible =
    loaded &&
    permission !== 'denied' &&
    settings.enabled &&
    settings.routine === 'off' &&
    !settings.routineOfferDismissed &&
    settings.routineVisits >= ROUTINE_VISITS_BEFORE_OFFER;
  if (!visible) return null;

  const save = async (slot: RoutineSlot, time: ReminderTime) => {
    setChoosing(null);
    // The card itself explains what will be sent, so the system prompt can follow.
    const allowed = permission === 'granted' || (await askPermission()) === 'granted';
    if (allowed)
      update({ routine: slot, routineTimes: { ...settings.routineTimes, [slot]: time } });
  };

  const offer = copy.routine.reminderOffer;
  return (
    <Card style={styles.card}>
      <Text variant="h3" accessibilityRole="header">
        {offer.title}
      </Text>
      <Text color="textSecondary">{offer.body}</Text>
      <View style={styles.actions}>
        <Button
          label={offer.morning}
          onPress={() => setChoosing('morning')}
          variant="secondary"
          size="sm"
        />
        <Button
          label={offer.evening}
          onPress={() => setChoosing('evening')}
          variant="secondary"
          size="sm"
        />
        <Button label={offer.notNow} onPress={dismissRoutineOffer} variant="ghost" size="sm" />
      </View>
      {choosing ? (
        <TimePickerDialog
          title={copy.settings.reminders.routineTimeTitle[choosing]}
          time={settings.routineTimes[choosing]}
          onCancel={() => setChoosing(null)}
          onSave={(time) => void save(choosing, time)}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
