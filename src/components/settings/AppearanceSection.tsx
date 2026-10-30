import { StyleSheet } from 'react-native';

import { Card, SectionTitle, SegmentedControl, Text, type IconName } from '@/components/ui';
import { copy } from '@/constants/copy';
import { APPEARANCE_PREFERENCES, type AppearancePreference } from '@/lib/appearance';
import { useAppearanceStore } from '@/stores/useAppearanceStore';
import { spacing } from '@/theme/tokens';

/** Each choice's icon, beside its name: the phone, the sun and the moon. */
const ICONS: Record<AppearancePreference, IconName> = {
  system: 'phone',
  light: 'sun',
  dark: 'moon',
};

const OPTIONS = APPEARANCE_PREFERENCES.map((value) => ({
  value,
  label: copy.settings.appearance.options[value],
  accessibilityLabel: copy.settings.appearance.optionLabels[value],
  icon: ICONS[value],
}));

/**
 * Light or dark colours, or the phone's own setting. A choice applies to the
 * whole app straight away, and is kept on this phone (useAppearanceStore).
 */
export function AppearanceSection() {
  const preference = useAppearanceStore((state) => state.preference);
  const error = useAppearanceStore((state) => state.error);
  const setPreference = useAppearanceStore((state) => state.setPreference);

  return (
    <Card style={styles.card}>
      <SectionTitle title={copy.settings.appearance.title} icon="contrast" />
      <SegmentedControl
        options={OPTIONS}
        value={preference}
        onChange={(value) => void setPreference(value)}
        accessibilityLabel={copy.settings.appearance.label}
      />
      <Text variant="bodySmall" color="textSecondary" accessibilityLiveRegion="polite">
        {copy.settings.appearance.notes[preference]}
      </Text>
      {error ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {error === 'load'
            ? copy.settings.appearance.loadFailed
            : copy.settings.appearance.saveFailed}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
});
