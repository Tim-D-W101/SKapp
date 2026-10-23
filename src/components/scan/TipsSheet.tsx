import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, IconBadge, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { cameraColors, layout, radius, sizes, spacing, useColors } from '@/theme/tokens';

export interface TipsSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** The "Why?" sheet: how to take photos that compare well week to week. */
export function TipsSheet({ visible, onClose }: TipsSheetProps) {
  const palette = useColors();
  const insets = useSafeAreaInsets();
  const tips = copy.scan.tips;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={copy.common.close}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.surfaceElevated,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
          accessibilityViewIsModal
        >
          <View style={[styles.handle, { backgroundColor: palette.border }]} />
          <Text variant="h2" accessibilityRole="header">
            {tips.title}
          </Text>
          <Text color="textSecondary">{tips.body}</Text>
          <View style={styles.points}>
            {tips.points.map((point) => (
              <View key={point} style={styles.point}>
                <IconBadge name="check" tone="filled" />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
          <Button label={copy.common.close} onPress={onClose} variant="secondary" fullWidth />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: cameraColors.scrim,
  },
  sheet: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingHorizontal: layout.gutter,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  /** Decorative: the sheet closes with its button, the back gesture or a tap outside. */
  handle: {
    alignSelf: 'center',
    width: sizes.sheetHandle.width,
    height: sizes.sheetHandle.height,
    marginBottom: spacing.sm,
    borderRadius: radius.full,
  },
  points: {
    gap: spacing.md,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pointText: {
    flex: 1,
  },
});
