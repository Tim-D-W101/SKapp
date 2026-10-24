import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { TabBar } from '@/components/navigation/TabBar';
import { TabIcon, type TabIconName } from '@/components/navigation/TabIcon';
import { copy } from '@/constants/copy';
import { useColors } from '@/theme/tokens';

/**
 * A tab's icon, in the colour TabBar gives it: solid white (dark ink in dark
 * mode) on the open tab's teal button, outlined teal on the other.
 */
function tabIcon(name: TabIconName) {
  return function TabBarIcon(props: { focused: boolean; color: ColorValue; size: number }) {
    return <TabIcon name={name} {...props} />;
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
        options={{ title: copy.tabs.progress, tabBarIcon: tabIcon('progress') }}
      />
    </Tabs>
  );
}
