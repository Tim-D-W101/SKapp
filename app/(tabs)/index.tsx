import { StyleSheet, View } from 'react-native';

import { EmptyState, Screen } from '@/components/ui';
import { copy } from '@/constants/copy';
import { startScan } from '@/lib/access';
import { spacing } from '@/theme/tokens';

/**
 * Home. A placeholder until scan results and progress exist: for now it offers
 * a scan.
 */
export default function Home() {
  return (
    <Screen edges={['top', 'right', 'left']} contentStyle={styles.content}>
      <View style={styles.main}>
        <EmptyState
          title={copy.progress.noScans.title}
          body={copy.progress.noScans.body}
          action={{
            label: copy.progress.noScans.cta,
            onPress: startScan,
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
  },
});
