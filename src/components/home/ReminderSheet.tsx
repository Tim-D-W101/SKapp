import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReminderControls } from '@/components/settings/ReminderControls';
import { Button, SectionTitle } from '@/components/ui';
import { copy } from '@/constants/copy';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { cameraColors, layout, radius, sizes, spacing, useColors } from '@/theme/tokens';

export interface ReminderSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * The sheet Home's reminders card opens: the same reminder controls as
 * Settings, so the time and the switches can be changed without leaving
 * Home. Changes save as they're made; Done only closes it. It scrolls when
 * the controls are taller than the screen allows.
 */
export function ReminderSheet({ visible, onClose }: ReminderSheetProps) {
  const palette = useColors();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'fade' : 'slide'}
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
          <SectionTitle title={copy.settings.reminders.title} icon="bell" tint="coral" />
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <ReminderControls />
          </ScrollView>
          <Button label={copy.common.done} onPress={onClose} variant="secondary" fullWidth />
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
    maxHeight: sizes.sheetMaxHeight,
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingHorizontal: layout.gutter,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  /** Decorative: the sheet closes with Done, the back gesture or a tap outside. */
  handle: {
    alignSelf: 'center',
    width: sizes.sheetHandle.width,
    height: sizes.sheetHandle.height,
    marginBottom: spacing.sm,
    borderRadius: radius.full,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xs,
  },
});
