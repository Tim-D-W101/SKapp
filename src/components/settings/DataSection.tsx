import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { logInDevelopment } from '@/lib/errors';
import { buildDataExport, removeStoredPhotos, shareDataExport } from '@/lib/personalData';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useScanStore } from '@/stores/useScanStore';
import { spacing } from '@/theme/tokens';

type Busy = 'export' | 'photos' | null;
type Message = { text: string; tone: 'success' | 'danger' } | null;

/** A copy of everything, deleting the photos, and the way to deleting the account. */
export function DataSection() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const email = useAuthStore((state) => state.user?.email ?? null);
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<Message>(null);

  const download = async () => {
    if (!userId) return;
    setBusy('export');
    setMessage(null);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        setMessage({ text: copy.settings.data.shareUnavailable, tone: 'danger' });
        return;
      }
      await shareDataExport(await buildDataExport(userId, email));
    } catch (error: unknown) {
      logInDevelopment('Could not export the data', error);
      setMessage({ text: copy.settings.data.downloadFailed, tone: 'danger' });
    } finally {
      setBusy(null);
    }
  };

  const deletePhotos = async () => {
    if (!userId) return;
    setBusy('photos');
    setMessage(null);
    try {
      await removeStoredPhotos(userId);
      setMessage({ text: copy.settings.data.deletePhotosDone, tone: 'success' });
    } catch (error: unknown) {
      logInDevelopment('Could not delete the scan photos', error);
      setMessage({ text: copy.settings.data.deletePhotosFailed, tone: 'danger' });
    } finally {
      // Links and images held in memory would otherwise keep showing
      // photos that may no longer exist.
      useProgressStore.getState().forgetPhotos();
      useScanStore.getState().forgetGhost();
      Image.clearMemoryCache().catch((cacheError: unknown) => {
        logInDevelopment('Could not clear the image cache', cacheError);
      });
      setBusy(null);
    }
  };

  const confirmDeletePhotos = () => {
    Alert.alert(copy.settings.data.deletePhotos, copy.settings.data.deletePhotosBody, [
      { text: copy.common.cancel, style: 'cancel' },
      {
        text: copy.settings.data.deletePhotosConfirm,
        style: 'destructive',
        onPress: () => void deletePhotos(),
      },
    ]);
  };

  return (
    <Card style={styles.card}>
      <Text variant="h3" accessibilityRole="header">
        {copy.settings.data.title}
      </Text>

      <View style={styles.item}>
        <Text color="textSecondary">{copy.settings.data.downloadBody}</Text>
        <Button
          label={copy.settings.data.download}
          onPress={() => void download()}
          loading={busy === 'export'}
          disabled={busy !== null}
          variant="secondary"
          fullWidth
        />
      </View>

      <View style={styles.item}>
        <Text color="textSecondary">{copy.settings.data.deletePhotosBody}</Text>
        <Button
          label={copy.settings.data.deletePhotos}
          onPress={confirmDeletePhotos}
          loading={busy === 'photos'}
          disabled={busy !== null}
          variant="secondary"
          fullWidth
        />
      </View>

      {message ? (
        <Text variant="bodySmall" color={message.tone} accessibilityLiveRegion="polite">
          {message.text}
        </Text>
      ) : null}

      <View style={styles.item}>
        <Text color="textSecondary">{copy.settings.data.deleteAccountBody}</Text>
        <Button
          label={copy.settings.data.deleteAccount}
          onPress={() => router.push('/delete-account')}
          disabled={busy !== null}
          variant="destructive"
          fullWidth
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  item: {
    gap: spacing.sm,
  },
});
