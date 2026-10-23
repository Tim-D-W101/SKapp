import { StyleSheet, View } from 'react-native';

import { sizes, spacing } from '@/theme/tokens';

import { Button } from './Button';
import { IconBadge } from './IconBadge';
import type { IconName } from './Icon';
import { SunMark } from './SunMark';
import { Text } from './Text';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  title: string;
  body: string;
  /** Shown on a soft badge. Without one, the sun mark stands in. */
  icon?: IconName;
  action?: EmptyStateAction;
}

export function EmptyState({ title, body, icon, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.art}>
        {icon ? <IconBadge name={icon} size="lg" /> : <SunMark width={sizes.sunMark.lg} />}
      </View>
      <Text variant="h2" align="center" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="body" color="textSecondary" align="center">
        {body}
      </Text>
      {action ? (
        <View style={styles.action}>
          <Button label={action.label} onPress={action.onPress} size="lg" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  art: {
    marginBottom: spacing.sm,
  },
  action: {
    marginTop: spacing.md,
  },
});
