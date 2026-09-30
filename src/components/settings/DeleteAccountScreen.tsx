import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Screen, Text, TextField } from '@/components/ui';
import { copy } from '@/constants/copy';
import { logInDevelopment } from '@/lib/errors';
import { deleteDataExportFile } from '@/lib/personalData';
import { useAuthStore } from '@/stores/useAuthStore';
import { sizes, spacing } from '@/theme/tokens';

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/settings');
}

/** Removes what the deleted account left on this phone: the last data export and cached images. */
function clearLocalCopies(): void {
  try {
    deleteDataExportFile();
  } catch (error: unknown) {
    logInDevelopment('Could not remove the data export file', error);
  }
  Image.clearMemoryCache().catch((error: unknown) => {
    logInDevelopment('Could not clear the image cache', error);
  });
}

/**
 * Deleting the account, for good. It says exactly what goes, and only acts
 * once DELETE has been typed. Every photo is removed from storage, then
 * every row and the user itself (delete_my_account), then the app starts
 * over as a new first launch. Anonymous accounts are deleted the same way.
 */
export function DeleteAccountScreen() {
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = copy.settings.deleteAccount;
  const confirmed = typed.trim() === text.confirmWord;

  const remove = async () => {
    if (!confirmed || deleting) return;
    setDeleting(true);
    setError(null);
    const result = await deleteAccount();
    if (!result.ok) {
      setDeleting(false);
      setError(result.message);
      return;
    }
    // By now the app has started over and this screen has gone.
    clearLocalCopies();
    Alert.alert(text.done);
  };

  return (
    <Screen scroll keyboardAvoiding contentStyle={styles.content}>
      <View style={styles.topBar}>
        <Button
          label={copy.common.close}
          leadingIcon="close"
          onPress={leave}
          disabled={deleting}
          variant="ghost"
          size="sm"
        />
      </View>

      <Text variant="h1" accessibilityRole="header">
        {text.title}
      </Text>

      <Card style={styles.card}>
        <Text>{text.deletes}</Text>
        <View style={styles.list}>
          {text.items.map((item) => (
            <View key={item} style={styles.item}>
              <Icon name="minus" size={sizes.icon.sm} color="textSecondary" />
              <Text color="textSecondary" style={styles.itemText}>
                {item}
              </Text>
            </View>
          ))}
        </View>
        <Text>{text.cannotUndo}</Text>
      </Card>

      <Text color="textSecondary">{text.subscriptionNote}</Text>
      <Text variant="bodySmall" color="textSecondary">
        {text.analyticsNote}
      </Text>

      <TextField
        label={text.typeToConfirm}
        value={typed}
        onChangeText={setTyped}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        editable={!deleting}
        returnKeyType="done"
        onSubmitEditing={() => void remove()}
      />

      {error ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button
        label={text.confirm}
        accessibilityLabel={deleting ? text.deleting : text.confirm}
        onPress={() => void remove()}
        disabled={!confirmed}
        loading={deleting}
        variant="destructive"
        fullWidth
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  topBar: {
    alignItems: 'flex-end',
  },
  card: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemText: {
    flex: 1,
  },
});
