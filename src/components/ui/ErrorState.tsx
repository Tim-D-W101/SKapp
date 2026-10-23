import { StyleSheet, View } from 'react-native';

import { copy } from '@/constants/copy';
import { spacing } from '@/theme/tokens';

import { Button } from './Button';
import { IconBadge } from './IconBadge';
import { Text } from './Text';

export interface ErrorStateProps {
  message: string;
  /** When provided, shows a retry button. */
  onRetry?: () => void;
  retryLabel?: string;
}

/** A calm, recoverable error. Deliberately not red: most errors here are a retry away. */
export function ErrorState({ message, onRetry, retryLabel = copy.common.retry }: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <IconBadge name="alert" size="lg" tone="neutral" />
      <Text variant="body" align="center">
        {message}
      </Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button label={retryLabel} onPress={onRetry} variant="secondary" leadingIcon="refresh" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  action: {
    marginTop: spacing.sm,
  },
});
