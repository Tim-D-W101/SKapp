import { StyleSheet, View } from 'react-native';

import { Button, Card, IconBadge, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { spacing } from '@/theme/tokens';

export interface PlansUnavailableProps {
  /** Why there are no plans: not set up in the store yet, or no connection. */
  message: string;
  onRetry: () => void;
  onBack: () => void;
  disabled: boolean;
}

/**
 * In place of the plans when the store has none to offer, which is expected
 * until the subscriptions are set up in Google Play. A calm explanation, a
 * retry that asks the store again, and a way back. No prices: those only
 * ever come from the store.
 */
export function PlansUnavailable({ message, onRetry, onBack, disabled }: PlansUnavailableProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.message} accessibilityLiveRegion="polite">
        <IconBadge name="info" size="lg" />
        <Text align="center">{message}</Text>
      </View>
      <Button
        label={copy.common.retry}
        leadingIcon="refresh"
        onPress={onRetry}
        disabled={disabled}
        fullWidth
      />
      <Button label={copy.paywall.back} onPress={onBack} variant="ghost" fullWidth />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  message: {
    alignItems: 'center',
    gap: spacing.md,
  },
});
