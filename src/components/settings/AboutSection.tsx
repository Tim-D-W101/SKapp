import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LegalLink } from '@/components/paywall/LegalLink';
import { Button, Card, Disclaimer, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { LEGAL_LINKS, SUPPORT_EMAIL } from '@/constants/links';
import { logInDevelopment } from '@/lib/errors';
import { spacing } from '@/theme/tokens';

/** The Privacy Policy and Terms, the full disclaimer, the version and support. */
export function AboutSection() {
  const [error, setError] = useState<string | null>(null);
  const version = Constants.expoConfig?.version ?? null;

  const failed = () => setError(copy.settings.about.linkFailed);

  const contactSupport = () => {
    if (!SUPPORT_EMAIL) return;
    setError(null);
    const subject = encodeURIComponent(copy.settings.about.supportSubject);
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}`).catch((openError: unknown) => {
      logInDevelopment('Could not open the email app', openError);
      failed();
    });
  };

  return (
    <Card style={styles.card}>
      <Text variant="h3" accessibilityRole="header">
        {copy.settings.about.title}
      </Text>

      <View style={styles.links}>
        <LegalLink label={copy.settings.about.privacy} url={LEGAL_LINKS.privacy} onFail={failed} />
        <LegalLink label={copy.settings.about.terms} url={LEGAL_LINKS.terms} onFail={failed} />
      </View>

      <View style={styles.disclaimer}>
        <Text variant="label" accessibilityRole="header">
          {copy.settings.about.disclaimer}
        </Text>
        <Disclaimer variant="full" />
      </View>

      {SUPPORT_EMAIL ? (
        <Button
          label={copy.settings.about.support}
          onPress={contactSupport}
          variant="secondary"
          fullWidth
        />
      ) : null}

      {error ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {version ? (
        <Text variant="caption" color="textSecondary">
          {copy.settings.about.version(version)}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.lg,
  },
  disclaimer: {
    gap: spacing.xs,
  },
});
