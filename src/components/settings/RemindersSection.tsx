import { StyleSheet } from 'react-native';

import { Card, SectionTitle } from '@/components/ui';
import { copy } from '@/constants/copy';
import { spacing } from '@/theme/tokens';

import { ReminderControls } from './ReminderControls';

/** Settings' Reminders section: every reminder control, on a card. Home's reminders card opens the same controls. */
export function RemindersSection() {
  return (
    <Card style={styles.card}>
      <SectionTitle title={copy.settings.reminders.title} icon="bell" tint="coral" />
      <ReminderControls />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
});
