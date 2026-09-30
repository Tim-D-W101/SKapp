import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { useAuthStore } from '@/stores/useAuthStore';
import { spacing } from '@/theme/tokens';

/** The linked email and signing out, or the prompt to save an anonymous account. */
export function AccountSection() {
  const email = useAuthStore((state) => state.user?.email);
  const isAnonymous = useAuthStore((state) => state.isAnonymous);
  const signOut = useAuthStore((state) => state.signOut);

  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setSigningOut(true);
    setError(null);
    const result = await signOut();
    // On success the app returns to a fresh first launch and this screen unmounts.
    if (!result.ok) {
      setSigningOut(false);
      setError(result.message);
    }
  };

  return (
    <Card style={styles.card}>
      <Text variant="h3" accessibilityRole="header">
        {copy.settings.account.title}
      </Text>
      {isAnonymous ? (
        <>
          <Text color="textSecondary">{copy.settings.account.anonymous}</Text>
          <Button
            label={copy.auth.saveProgress.cta}
            onPress={() => router.push({ pathname: '/sign-in', params: { mode: 'save' } })}
            fullWidth
          />
        </>
      ) : (
        <>
          <Text color="textSecondary">{copy.settings.account.signedInAs(email ?? '')}</Text>
          <Button
            label={copy.auth.signOut}
            onPress={() => void handleSignOut()}
            loading={signingOut}
            variant="secondary"
            fullWidth
          />
          {error ? (
            <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
});
