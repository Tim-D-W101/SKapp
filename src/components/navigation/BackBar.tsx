import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui';
import { copy } from '@/constants/copy';
import { goBackOrHome } from '@/lib/navigation';
import { layout, spacing } from '@/theme/tokens';

/**
 * A Back button at the top of a screen that opens from Home. Place it outside
 * the screen's scrolling content, so it never scrolls out of reach.
 */
export function BackBar() {
  return (
    <View style={styles.bar}>
      <Button
        label={copy.common.back}
        leadingIcon="back"
        onPress={goBackOrHome}
        variant="ghost"
        size="sm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'flex-start',
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.sm,
  },
});
