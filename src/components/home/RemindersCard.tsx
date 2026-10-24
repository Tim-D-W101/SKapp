import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, LoadingState, SectionTitle, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatShortDate, formatTime } from '@/lib/dates';
import { relativeDay, remindersCardState, type RemindersCardState } from '@/lib/nextReminder';
import { useReminderStore } from '@/stores/useReminderStore';
import { opacity, sizes, spacing, useColors } from '@/theme/tokens';

import { ReminderSheet } from './ReminderSheet';

/** Skeleton lines shown until the next reminder is known. */
const LOADING_LINES = 1;

/** The card's main line for a state it can be tapped in. */
function statusLine(state: RemindersCardState, now: Date): string {
  switch (state.kind) {
    case 'next':
      return copy.home.reminders.next(
        state.name,
        relativeDay(state.date, now),
        formatTime(state.date.getHours(), state.date.getMinutes()),
        formatShortDate(state.date.toISOString()),
      );
    case 'none':
      return copy.home.reminders.none;
    default:
      return copy.home.reminders.off;
  }
}

/**
 * The reminders card on Home, under today's routine: the next reminder the
 * phone has scheduled, or that reminders are off. Tapping it opens the same
 * reminder controls as Settings in a sheet. When only the master switch is
 * off, the tap turns reminders back on as it opens them. It reads the plan
 * the reminder store last scheduled and never makes one of its own; if
 * making it failed, it asks the store to try again each time Home is shown.
 * It's a plain card that carries its coral on the bell badge and the action,
 * so the latest scan stays the one tinted card on Home.
 */
export function RemindersCard() {
  const palette = useColors();
  const loaded = useReminderStore((state) => state.loaded);
  const permission = useReminderStore((state) => state.permission);
  const enabled = useReminderStore((state) => state.settings.enabled);
  const plan = useReminderStore((state) => state.plan);
  const planFailed = useReminderStore((state) => state.planFailed);
  const update = useReminderStore((state) => state.update);
  const reschedule = useReminderStore((state) => state.reschedule);
  const [sheetOpen, setSheetOpen] = useState(false);

  // A plan that couldn't be made (offline) is tried again whenever Home comes back into view.
  useFocusEffect(
    useCallback(() => {
      if (useReminderStore.getState().planFailed) void reschedule();
    }, [reschedule]),
  );

  const now = new Date();
  const state = remindersCardState({
    now,
    loaded,
    permission,
    enabled,
    plan,
    planFailed,
  });
  const tint = palette.tints.coral;
  const title = <SectionTitle title={copy.home.reminders.title} icon="bell" tint="coral" />;

  // Outside the card's states, so it stays open while they change underneath
  // it, as when permission is granted and the plan is being made.
  const sheet = <ReminderSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />;

  if (state.kind === 'loading' || state.kind === 'failed') {
    return (
      <>
        <Card style={styles.card}>
          {title}
          {state.kind === 'failed' ? (
            <View style={styles.notice} accessibilityLiveRegion="polite">
              <Text variant="bodySmall" color="textSecondary" style={styles.noticeText}>
                {copy.home.reminders.loadFailed}
              </Text>
              <Button
                label={copy.common.retry}
                onPress={() => void reschedule()}
                variant="ghost"
                size="sm"
              />
            </View>
          ) : (
            <LoadingState lines={LOADING_LINES} />
          )}
        </Card>
        {sheet}
      </>
    );
  }

  const isOff = state.kind !== 'next' && state.kind !== 'none';
  // Only the master switch can be flipped from here. A permission still to be
  // asked for, or refused, is explained in the sheet first.
  const turnsOn = state.kind === 'off';
  const line = statusLine(state, now);

  const open = () => {
    if (turnsOn) update({ enabled: true });
    setSheetOpen(true);
  };

  return (
    <>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={copy.home.reminders.cardLabel(line)}
        accessibilityHint={
          turnsOn ? copy.home.reminders.turnOnHint : copy.home.reminders.changeHint
        }
        style={({ pressed }) => (pressed ? styles.pressed : null)}
      >
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.title}>{title}</View>
            <View style={styles.action}>
              <Text variant="label" tint="coral">
                {isOff ? copy.home.reminders.turnOn : copy.home.reminders.change}
              </Text>
              <Icon name="chevronRight" size={sizes.icon.md} tint={tint.text} />
            </View>
          </View>
          <Text color={isOff ? 'textSecondary' : 'textPrimary'}>{line}</Text>
          {state.kind === 'none' ? (
            <Text variant="bodySmall" color="textSecondary">
              {copy.home.reminders.noneBody}
            </Text>
          ) : null}
        </Card>
      </Pressable>
      {sheet}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
  },
});
