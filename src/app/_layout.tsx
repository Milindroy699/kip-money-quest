import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useProgressBackup } from '@/account/session';
import { useLeagueSync } from '@/social/useLeagueSync';
import { configureSound } from '@/audio/sound';
import { DEMO_ENABLED, DEMO_TOUR, seedDemoState, startDemoTour } from '@/dev/demo';
import { useNudgeScheduler, useNudgeTapRouting } from '@/engagement/useNudges';
import { useGame } from '@/state/game';
import { colors } from '@/ui/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
// A known, harmless React Native dev warning from native-driver animations (no effect on users).
LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered']);

export default function RootLayout() {
  const onboarded = useGame((s) => s.profile.onboarded);
  const soundOn = useGame((s) => s.profile.soundOn);
  const musicOn = useGame((s) => s.profile.musicOn);
  useNudgeScheduler();
  useNudgeTapRouting();
  useProgressBackup();
  useLeagueSync();

  useEffect(() => {
    configureSound({ sound: soundOn, music: musicOn });
  }, [soundOn, musicOn]);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    if (!DEMO_ENABLED) return;
    seedDemoState();
    if (!DEMO_TOUR) return;
    let stop: (() => void) | undefined;
    const start = setTimeout(() => (stop = startDemoTour()), 4000);
    return () => {
      clearTimeout(start);
      stop?.();
    };
  }, []);

  return (
    // Gesture Handler needs a root view (the sliders use it, so drags run on the UI thread).
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="world/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="lesson/[id]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="run/[mode]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="review" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="card/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="dividend" options={{ presentation: 'modal' }} />
          <Stack.Screen name="freeze" options={{ presentation: 'modal' }} />
          <Stack.Screen name="plan" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="account" options={{ presentation: 'modal' }} />
          <Stack.Screen name="portfolio" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="duel" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="parent" options={{ presentation: 'modal' }} />
          <Stack.Screen name="stat/[kind]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="avatar" options={{ presentation: 'modal' }} />
          <Stack.Screen name="quiz" options={{ presentation: 'fullScreenModal' }} />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
