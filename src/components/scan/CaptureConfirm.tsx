import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { PHOTO_PORTRAIT_ASPECT } from '@/constants/capture';
import { copy } from '@/constants/copy';
import { logInDevelopment } from '@/lib/errors';
import { useScanStore } from '@/stores/useScanStore';
import { radius, spacing, useColors } from '@/theme/tokens';

/** The largest frame of the photo's own shape (width / height) that fits the space. */
function fitPhoto(space: { width: number; height: number }, aspect: number) {
  const width = Math.min(space.width, space.height * aspect);
  return { width, height: width / aspect };
}

/**
 * Shows the photo before anything is sent, whole and in its own shape, so
 * there are no empty bands around it. "Use this" is the only way forward.
 */
export function CaptureConfirm() {
  // The photo as it was on arrival. Retake clears the store's copy, and this
  // screen keeps showing its own while it animates away.
  const [capture] = useState(() => useScanStore.getState().capture);
  const submitCapture = useScanStore((state) => state.submitCapture);
  const discardCapture = useScanStore((state) => state.discardCapture);
  const [kilobytes, setKilobytes] = useState<number | null>(null);
  const [space, setSpace] = useState({ width: 0, height: 0 });
  const submitted = useRef(false);
  const palette = useColors();

  // Development only: the file size, to check the photo stays well under 500 KB.
  useEffect(() => {
    if (!__DEV__ || !capture) return;
    let active = true;
    fetch(capture.uri)
      .then((response) => response.blob())
      .then((blob) => {
        if (active) setKilobytes(Math.round(blob.size / 1024));
      })
      .catch((sizeError: unknown) => logInDevelopment('Could not read photo size', sizeError));
    return () => {
      active = false;
    };
  }, [capture]);

  if (!capture) return <Redirect href="/scan/capture" />;

  const retake = () => {
    discardCapture();
    router.back();
  };

  const use = () => {
    // A second tap before the screen changes would send the photo twice.
    if (submitted.current) return;
    submitted.current = true;
    // Progress and errors show on the waiting screen, so this isn't awaited.
    void submitCapture();
    router.replace('/scan/analysing');
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSpace({ width, height });
  };

  // The photo's own shape; a photo without sizes is drawn in the camera's 3:4.
  const aspect =
    capture.width > 0 && capture.height > 0
      ? capture.width / capture.height
      : PHOTO_PORTRAIT_ASPECT;
  const frame = fitPhoto(space, aspect);

  return (
    <Screen contentStyle={styles.content}>
      <Text variant="h2" accessibilityRole="header">
        {copy.scan.confirm.title}
      </Text>
      <View style={styles.photoArea} onLayout={handleLayout}>
        {space.width > 0 ? (
          <View
            style={[
              styles.photoFrame,
              { width: frame.width, height: frame.height, backgroundColor: palette.surface },
            ]}
          >
            <Image
              source={{ uri: capture.uri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="none"
              accessibilityLabel={copy.scan.confirm.title}
            />
          </View>
        ) : null}
      </View>
      {__DEV__ ? (
        <Text variant="caption" color="textTertiary" align="center">
          {copy.scan.confirm.devSize(capture.width, capture.height, kilobytes)}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Button label={copy.scan.confirm.use} onPress={use} fullWidth size="lg" />
        <Button label={copy.scan.confirm.retake} onPress={retake} variant="secondary" fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  photoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoFrame: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  actions: {
    gap: spacing.sm,
  },
});
