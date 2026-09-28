import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { hapticSelection } from '@/lib/haptics';
import type { Plan } from '@/lib/purchases';
import { opacity, radius, sizes, spacing, useColors } from '@/theme/tokens';

export interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  /** The annual plan's "best value" line, with its saving. */
  badge: string | null;
  disabled: boolean;
  onSelect: () => void;
}

/**
 * One plan, as a radio option. The billed amount is the most prominent thing
 * on it, and never a per-week equivalent.
 */
export function PlanCard({ plan, selected, badge, disabled, onSelect }: PlanCardProps) {
  const palette = useColors();
  const name = copy.paywall.plans[plan.id];
  const price = copy.paywall.pricePer[plan.id](plan.priceString);
  const trial = plan.trial ? copy.paywall.trialBadge(plan.trial.count, plan.trial.unit) : null;
  const notes = [badge, trial].filter((note): note is string => note !== null);

  const handlePress = () => {
    hapticSelection();
    onSelect();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={copy.paywall.planLabel([name, price, ...notes])}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: selected ? palette.accent : palette.border,
          backgroundColor: selected ? palette.accentSubtle : palette.surface,
          opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
        },
      ]}
    >
      <View
        style={[
          styles.mark,
          {
            borderColor: selected ? palette.accent : palette.border,
            backgroundColor: selected ? palette.accent : 'transparent',
          },
        ]}
      >
        {selected ? <Icon name="check" size={sizes.icon.sm} tint={palette.textInverse} /> : null}
      </View>
      <View style={styles.text}>
        <Text variant="label">{name}</Text>
        <Text>{price}</Text>
        {notes.map((note) => (
          <Text key={note} variant="bodySmall" color="accent">
            {note}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
  },
  mark: {
    width: sizes.checkbox,
    height: sizes.checkbox,
    borderRadius: radius.full,
    borderWidth: sizes.checkboxBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
});
