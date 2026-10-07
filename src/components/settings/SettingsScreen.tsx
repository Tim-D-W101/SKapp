import { StyleSheet } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { spacing } from '@/theme/tokens';

import { AboutSection } from './AboutSection';
import { AccountSection } from './AccountSection';
import { DataSection } from './DataSection';
import { RemindersSection } from './RemindersSection';
import { SubscriptionSection } from './SubscriptionSection';

/** Account, subscription, reminders, the person's data, and the legal pages. */
export function SettingsScreen() {
  return (
    <Screen scroll edges={['top', 'right', 'left']} contentStyle={styles.content}>
      <Text variant="h1" accessibilityRole="header">
        {copy.settings.title}
      </Text>
      <AccountSection />
      <SubscriptionSection />
      <RemindersSection />
      <DataSection />
      <AboutSection />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
});
