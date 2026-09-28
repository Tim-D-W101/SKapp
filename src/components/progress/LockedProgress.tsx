import { StyleSheet } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { openPaywall } from '@/lib/access';
import { spacing } from '@/theme/tokens';

/** In place of the trend and comparisons, for someone who has never subscribed. */
export function LockedProgress() {
  return (
    <Card style={styles.card}>
      <Text variant="h3" accessibilityRole="header">
        {copy.progress.locked.title}
      </Text>
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
