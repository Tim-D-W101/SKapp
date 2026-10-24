import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, SunMark, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { startScan } from '@/lib/access';
import { hapticImpact } from '@/lib/haptics';
import { layout, motion, radius, shadows, sizes, spacing, useColors } from '@/theme/tokens';

/**
 * The big "Scan my skin" card at the top of Home: the app's mark on the
 * brand teal, its sun rising in sun yellow, with a sun-yellow camera badge.
 * It starts a scan the same way every other scan button does, so once the
 * free scan is used it opens the plans instead.
 */
export function ScanCard() {
  const palette = useColors();
  const camera = palette.tints.sun;

  const scan = () => {
    hapticImpact();
    startScan();
  };

  return (
    <Pressable
      onPress={scan}
      accessibilityRole="button"
      accessibilityLabel={copy.home.scan.title}
      accessibilityHint={copy.home.scan.hint}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? palette.accentPressed : palette.accent,
          transform: [{ scale: pressed ? motion.pressScale : 1 }],
        },
        shadows.md,
      ]}
    >
      <SunMark width={sizes.scanCard.mark} on="accent" />
      <View style={styles.text}>
        <Text variant="h2" color="textInverse">
          {copy.home.scan.title}
        </Text>
        <Text variant="bodySmall" color="textInverse">
          {copy.home.scan.body}
        </Text>
      </View>
      <View style={[styles.camera, { backgroundColor: camera.fill }]}>
        <Icon name="camera" size={sizes.icon.lg} tint={camera.onFill} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: layout.cardPadding,
    borderRadius: radius.xl,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  camera: {
    width: sizes.scanCard.camera,
    height: sizes.scanCard.camera,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
