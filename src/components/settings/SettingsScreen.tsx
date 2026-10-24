import { ScrollView, StyleSheet } from 'react-native';

import { BackBar } from '@/components/navigation/BackBar';
import { Screen, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { useBackToHome } from '@/lib/navigation';
import { PREMIUM_PREVIEW_AVAILABLE } from '@/stores/usePremiumPreviewStore';
import { layout, spacing } from '@/theme/tokens';

import { AboutSection } from './AboutSection';
import { AccountSection } from './AccountSection';
import { AppearanceSection } from './AppearanceSection';
import { DataSection } from './DataSection';
import { RemindersSection } from './RemindersSection';
import { SubscriptionSection } from './SubscriptionSection';
import { TestingSection } from './TestingSection';

/**
 * Account, appearance (light, dark or the phone's setting), subscription,
 * reminders, the person's data, and the legal pages.
 * It opens from the profile button at the top of Home. Test builds that
 * offer the premium preview also get a Testing section; no other build
 * shows it.
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
        <AppearanceSection />
        <SubscriptionSection />
        <RemindersSection />
        <DataSection />
        {PREMIUM_PREVIEW_AVAILABLE ? <TestingSection /> : null}
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
