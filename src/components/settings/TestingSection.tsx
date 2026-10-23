import { StyleSheet } from 'react-native';

import { Card, SectionTitle, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { usePremiumPreviewStore } from '@/stores/usePremiumPreviewStore';
import { spacing } from '@/theme/tokens';

import { SwitchRow } from './SwitchRow';

/**
 * Tools for testing a preview build: for now, the "Preview premium" switch
 * (lib/premiumPreview.ts). Settings only shows it in a build that offers it
 * (PREMIUM_PREVIEW_AVAILABLE), never in a production build.
 */
export function TestingSection() {
  const enabled = usePremiumPreviewStore((state) => state.enabled);
  const error = usePremiumPreviewStore((state) => state.error);
  const setEnabled = usePremiumPreviewStore((state) => state.setEnabled);

  return (
    <Card style={styles.card}>
      <SectionTitle title={copy.settings.testing.title} icon="settings" tint="coral" />
      <Text color="textSecondary">{copy.settings.testing.intro}</Text>
      <SwitchRow
        label={copy.settings.testing.premiumPreview}
        hint={copy.settings.testing.premiumPreviewHint}
        value={enabled}
        onChange={(value) => void setEnabled(value)}
      />
      <Text variant="bodySmall" color="textSecondary">
        {copy.settings.testing.serverNote}
      </Text>
      {error ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {error === 'load' ? copy.settings.testing.loadFailed : copy.settings.testing.saveFailed}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
});
