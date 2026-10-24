import { StyleSheet } from 'react-native';

import { Button, Card, SectionTitle, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { openPaywall } from '@/lib/access';
import { spacing } from '@/theme/tokens';

/** In place of the trend and comparisons, for someone who has never subscribed. */
export function LockedProgress() {
  return (
    <Card style={styles.card}>
      <SectionTitle title={copy.progress.locked.title} icon="chart" tint="mint" />
      <Text color="textSecondary">{copy.progress.locked.body}</Text>
      <Button label={copy.progress.locked.cta} onPress={() => openPaywall('progress')} fullWidth />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
});
