import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, IconBadge, LoadingState, SectionHeader, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { formatShortDate, formatTime } from '@/lib/dates';
import { relativeDay, remindersCardState, type RemindersCardState } from '@/lib/nextReminder';
import { useReminderStore } from '@/stores/useReminderStore';
import { opacity, radius, sizes, spacing, useColors } from '@/theme/tokens';

import { ReminderSheet } from './ReminderSheet';

/** Skeleton lines shown until the next reminder is known. */
const LOADING_LINES = 1;

/** What the card says in a state it can be tapped in: a headline, and the line under it. */
function cardText(state: RemindersCardState, now: Date): { headline: string; detail: string } {
  switch (state.kind) {
    case 'next':
      return {
        headline: formatTime(state.date.getHours(), state.date.getMinutes()),
        detail: copy.home.reminders.detail(
          state.name,
          relativeDay(state.date, now),
          formatShortDate(state.date.toISOString()),
        ),
      };
    case 'none':
      return { headline: copy.home.reminders.none, detail: copy.home.reminders.noneBody };
    default:
      return { headline: copy.home.reminders.off, detail: copy.home.reminders.offBody };
  }
}

/** The card's whole message for screen readers: "Next reminder: Morning routine, tomorrow at 7:30 AM". */
function spokenLine(state: RemindersCardState, now: Date): string {
  if (state.kind !== 'next') return cardText(state, now).headline;
  return copy.home.reminders.next(
    state.name,
    relativeDay(state.date, now),
    formatTime(state.date.getHours(), state.date.getMinutes()),
    formatShortDate(state.date.toISOString()),
  );
}

/**
 * The reminders card on Home, under today's routine: the next reminder's
 * time, large, with what it's for and its day under it; or that reminders
 * are off. The whole card is one button, with a "Change" (or "Turn on") pill
 * so it plainly can be: it opens the same reminder controls as Settings in a
 * sheet, where each time is picked. When only the master switch is off, the
 * tap turns reminders back on as it opens them. It reads the plan the
 * reminder store last scheduled and never makes one of its own; if making it
 * failed, it asks the store to try again each time Home is shown. Its coral
 * is on the bell, the colour of a nudge to come back.
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
  const header = <SectionHeader title={copy.home.reminders.title} />;

  // Outside the card's states, so it stays open while they change underneath
  // it, as when permission is granted and the plan is being made.
  const sheet = <ReminderSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />;

  if (state.kind === 'loading' || state.kind === 'failed') {
    return (
      <View style={styles.section}>
        {header}
        <Card>
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
      </View>
    );
  }

  const isOff = state.kind !== 'next' && state.kind !== 'none';
  // Only the master switch can be flipped from here. A permission still to be
  // asked for, or refused, is explained in the sheet first.
  const turnsOn = state.kind === 'off';
  const { headline, detail } = cardText(state, now);

  const open = () => {
    if (turnsOn) update({ enabled: true });
    setSheetOpen(true);
  };

  return (
    <View style={styles.section}>
      {header}
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={copy.home.reminders.cardLabel(spokenLine(state, now))}
        accessibilityHint={
          turnsOn ? copy.home.reminders.turnOnHint : copy.home.reminders.changeHint
        }
        style={({ pressed }) => (pressed ? styles.pressed : null)}
      >
        <Card style={styles.card}>
          <IconBadge name="bell" size="md" tone="filled" tint="coral" />
          <View style={styles.text}>
            <Text variant={state.kind === 'next' ? 'h2' : 'label'}>{headline}</Text>
            <Text variant="bodySmall" color="textSecondary">
              {detail}
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: palette.surfaceMuted }]}>
            <Text variant="label" color="accentText">
              {isOff ? copy.home.reminders.turnOn : copy.home.reminders.change}
            </Text>
          </View>
        </Card>
      </Pressable>
      {sheet}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  /** Not a button of its own: the whole card is. It only says what a tap does. */
  pill: {
    justifyContent: 'center',
    minHeight: sizes.control.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
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
