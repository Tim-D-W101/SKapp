import { ScrollView, StyleSheet } from 'react-native';

import { BackBar } from '@/components/navigation/BackBar';
import { Screen, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { useBackToHome } from '@/lib/navigation';
import { layout, spacing } from '@/theme/tokens';

import { AboutSection } from './AboutSection';
import { AccountSection } from './AccountSection';
import { DataSection } from './DataSection';
import { RemindersSection } from './RemindersSection';
import { SubscriptionSection } from './SubscriptionSection';

/**
 * Account, subscription, reminders, the person's data, and the legal pages.
 * It opens from the profile button at the top of Home.
 */
export function SettingsScreen() {
  useBackToHome();

  return (
    <Screen padded={false}>
      <BackBar />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="h1" accessibilityRole="header">
          {copy.settings.title}
        </Text>
        <AccountSection />
        <SubscriptionSection />
        <RemindersSection />
        <DataSection />
        <AboutSection />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: layout.gutter,
  },
});
