import { Tabs } from 'expo-router';

import { TabBar } from '@/components/navigation/TabBar';
import { Icon, type IconName } from '@/components/ui';
import { copy } from '@/constants/copy';
import { useColors } from '@/theme/tokens';

/** A tab's icon: white (dark ink in dark mode) on the open tab's teal button, teal on the other. */
function tabIcon(name: IconName) {
  return function TabIcon({ focused, size }: { focused: boolean; size: number }) {
    return <Icon name={name} size={size} color={focused ? 'textInverse' : 'accentText'} />;
  };
}

/**
 * Two tabs, Home and Progress, as the two big buttons TabBar draws. Scanning,
 * the routine and Settings all open from Home.
 */
export default function TabsLayout() {
  const palette = useColors();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      // Android's back button on Progress goes to Home; on Home it leaves the app.
      backBehavior="firstRoute"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: copy.tabs.home, tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen
        name="progress"
        options={{ title: copy.tabs.progress, tabBarIcon: tabIcon('chart') }}
      />
    </Tabs>
  );
}
