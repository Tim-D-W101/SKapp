import { Tabs } from 'expo-router';

import { TabBar } from '@/components/navigation/TabBar';
import { Icon } from '@/components/ui';
import { copy } from '@/constants/copy';
import { sizes, useColors } from '@/theme/tokens';

/**
 * Two tabs, Home and Progress, in the plain bar TabBar draws. Scanning, the
 * routine and Settings all open from Home.
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
      <Tabs.Screen
        name="index"
        options={{
          title: copy.tabs.home,
          tabBarIcon: ({ focused }) => (
            <Icon
              name="home"
              size={sizes.icon.lg}
              color={focused ? 'accentText' : 'textSecondary'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: copy.tabs.progress,
          tabBarIcon: ({ focused }) => (
            <Icon
              name="chart"
              size={sizes.icon.lg}
              color={focused ? 'accentText' : 'textSecondary'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
