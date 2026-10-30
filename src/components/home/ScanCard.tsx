import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, SunMark, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { startScan } from '@/lib/access';
import { hapticImpact } from '@/lib/haptics';
import { layout, motion, radius, shadows, sizes, spacing, useColors } from '@/theme/tokens';

export interface ScanCardProps {
  /**
   * The line under the title: when the next weekly scan is suggested, once
   * there's been a scan. Without it, what a scan gives.
   */
  note?: string;
}

/**
 * The big "Scan my skin" card at the top of Home, and the one block of brand
 * colour on it: the app's mark on the icon's teal (in dark mode too, where it
 * glows without glaring), its sun rising in sun yellow, with a coral camera
 * button. It starts a scan the same way every other scan button does, so
 * once the free scan is used it opens the plans instead.
 */
export function ScanCard({ note }: ScanCardProps) {
  const palette = useColors();
  const camera = palette.tints.coral;

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
          backgroundColor: pressed ? palette.brandPressed : palette.brand,
          transform: [{ scale: pressed ? motion.pressScale : 1 }],
        },
        shadows.md,
      ]}
    >
      <SunMark width={sizes.scanCard.mark} on="brand" />
      <View style={styles.text}>
        <Text variant="h2" color="onBrand">
          {copy.home.scan.title}
        </Text>
        <Text variant="bodySmall" color="onBrand">
          {note ?? copy.home.scan.body}
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
