import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Button, Card, SectionTitle, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { spacing } from '@/theme/tokens';

export interface CompareEntryProps {
  scanCount: number;
}

/** The way into the before-and-after comparison. Needs two scans, and says so until then. */
export function CompareEntry({ scanCount }: CompareEntryProps) {
  return (
    <Card style={styles.card}>
      <SectionTitle title={copy.progress.compare.title} icon="drag" tint="mint" />
      {scanCount < 2 ? (
        <Text color="textSecondary">{copy.progress.compare.needTwo}</Text>
      ) : (
        <>
          <Text color="textSecondary">{copy.progress.compare.entryBody}</Text>
          <Button
            label={copy.progress.compare.open}
            onPress={() => router.push('/progress/compare')}
            variant="secondary"
            fullWidth
          />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
});
