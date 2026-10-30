import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui';
import { copy } from '@/constants/copy';
import { sizes, useColors } from '@/theme/tokens';

export interface CompletionRingProps {
  done: number;
  total: number;
}

/**
 * Today's routine as a small ring that fills step by step, with the count in
 * the middle. It sits beside the routine's title, which says the same in
 * words, so the steps start high on the screen.
 */
export function CompletionRing({ done, total }: CompletionRingProps) {
  const palette = useColors();
  const size = sizes.completionRing.size;
  const stroke = sizes.completionRing.stroke;
  const center = size / 2;
  const ringRadius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const fraction = total > 0 ? Math.min(1, done / total) : 0;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={copy.routine.title}
      accessibilityValue={{
        min: 0,
        max: total,
        now: done,
        text: copy.routine.completion(done, total),
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke={palette.surfaceMuted}
          strokeWidth={stroke}
          fill="none"
        />
        {fraction > 0 ? (
          <Circle
            cx={center}
            cy={center}
            r={ringRadius}
            stroke={palette.accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - fraction)}
            fill="none"
            transform={`rotate(-90 ${center} ${center})`}
          />
        ) : null}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text variant="label">{copy.routine.ringValue(done, total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
