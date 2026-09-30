import * as Linking from 'expo-linking';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui';
import { logInDevelopment } from '@/lib/errors';
import { opacity, sizes, typography } from '@/theme/tokens';

export interface LegalLinkProps {
  label: string;
  /** Null until the page's address is configured. */
  url: string | null;
  /** Called when the page can't be opened, so the screen can say so. */
  onFail: () => void;
}

const VERTICAL_SLOP = Math.max(0, (sizes.minTouchTarget - typography.bodySmall.lineHeight) / 2);

/** A link to a web page (Terms, Privacy Policy), opened in the phone's browser. */
export function LegalLink({ label, url, onFail }: LegalLinkProps) {
  const open = () => {
    if (!url) {
      logInDevelopment('No address configured for a legal page', label);
      onFail();
      return;
    }
    Linking.openURL(url).catch((error: unknown) => {
      logInDevelopment('Could not open a legal page', error);
      onFail();
    });
  };

  return (
    <Pressable
      onPress={open}
      hitSlop={{ top: VERTICAL_SLOP, bottom: VERTICAL_SLOP }}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={({ pressed }) => ({ opacity: pressed ? opacity.pressed : 1 })}
    >
      <Text variant="bodySmall" color="accent" style={styles.text}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    textDecorationLine: 'underline',
  },
});
