import { Tabs } from 'expo-router/js-tabs';

import { HeroTabBar } from '@/ui/HeroTabBar';

/** Home · Cards · [Campus hero] · League · You. The hero opens the learning path (Worlds 1–9). */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <HeroTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="cards" options={{ title: 'Trophies' }} />
      <Tabs.Screen name="campus" options={{ title: 'Campus' }} />
      <Tabs.Screen name="league" options={{ title: 'League' }} />
      <Tabs.Screen name="you" options={{ title: 'You' }} />
    </Tabs>
  );
}
