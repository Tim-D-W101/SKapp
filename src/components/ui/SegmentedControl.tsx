import { Pressable, StyleSheet, View } from 'react-native';

import { hapticSelection } from '@/lib/haptics';
import { radius, sizes, spacing, useColors } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  /** Defaults to `label`. Set it when the label is shortened, as with "Mon" for Monday. */
  accessibilityLabel?: string;
  icon?: IconName;
}

export interface SegmentedControlProps<T extends string | number> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** What is being chosen, for screen readers. */
  accessibilityLabel: string;
}

/** The least a label shrinks to, as a fraction, so it fits its segment at the largest text sizes. */
const MIN_LABEL_SCALE = 0.6;

/**
 * Pick one of a few options, laid out as equal segments in a single row: the
 * chosen one filled in the brand colour. Always one row, so a short list such
 * as the days of the week never wraps unevenly. Announced as radio buttons.
 */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const palette = useColors();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: palette.surface, borderColor: palette.border }]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const ink = selected ? 'textInverse' : 'textPrimary';
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              if (selected) return;
              hapticSelection();
              onChange(option.value);
            }}
            // The track's padding makes up the rest of a full-size touch target.
            hitSlop={{ top: spacing.xs, bottom: spacing.xs }}
            accessibilityRole="radio"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ checked: selected }}
            style={({ pressed }) => [
              styles.segment,
              {
                backgroundColor: selected
                  ? palette.accent
                  : pressed
                    ? palette.accentSubtle
                    : 'transparent',
              },
            ]}
          >
            {option.icon ? <Icon name={option.icon} size={sizes.icon.sm} color={ink} /> : null}
            <Text
              variant="label"
              color={ink}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={MIN_LABEL_SCALE}
              style={styles.label}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.full,
    borderWidth: sizes.borderWidth,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: sizes.control.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
  },
  label: {
    flexShrink: 1,
  },
});
