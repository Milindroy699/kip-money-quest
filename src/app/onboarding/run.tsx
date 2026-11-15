/** Onboarding 4/6 — first run: a forgiving 45-second Inflation Chase tutorial. */
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RunResult } from '@/game/runner/engine';
import { RunGuide } from '@/game/runner/RunGuide';
import { RunnerScene } from '@/game/runner/RunnerScene';
import { RunResults } from '@/game/runner/RunResults';
import { Character } from '@/mascot/Character';
import { SpeechBubble } from '@/mascot/SpeechBubble';
import { OnboardingFrame } from '@/onboarding/OnboardingFrame';
import { useGame, type Reward } from '@/state/game';
import { ArtCaption, Button } from '@/ui/components';
import { colors, space } from '@/ui/theme';

export default function FirstRun() {
  // The guide to everything on the road comes first; then the brief with the start buttons.
  const [phase, setPhase] = useState<'guide' | 'brief' | 'run' | 'done'>('guide');
  const [result, setResult] = useState<RunResult | null>(null);
  const [reward, setReward] = useState<Reward | null>(null);
  const [auto, setAuto] = useState(false);
  const completeRun = useGame((s) => s.completeRun);
  const insets = useSafeAreaInsets();

  if (phase === 'run') {
    return (
      <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.cream }}>
        <RunnerScene
          mode="inflation"
          durationSec={45}
          seed={2026}
          tutorial
          autopilot={auto}
          onFinish={(r) => {
            setReward(completeRun(r, { autopilot: auto }));
            setResult(r);
            setPhase('done');
          }}
        />
      </View>
    );
  }
  if (phase === 'done' && result) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.cream }}>
        <RunResults result={result} reward={reward ?? undefined} autopilot={auto} continueLabel="Collect my first cards" onContinue={() => router.push('/onboarding/cards')} />
      </View>
    );
  }
  if (phase === 'guide') {
    return (
      <OnboardingFrame step={4} footer={null}>
        <RunGuide onDone={() => setPhase('brief')} />
      </OnboardingFrame>
    );
  }
  return (
    <OnboardingFrame step={4} footer={
        <>
          <Button testID="start-first-run" title="Start my first run ▶" onPress={() => setPhase('run')} />
          <Button
            testID="watch-kip"
            title="Watch Kip play instead"
            variant="ghost"
            onPress={() => {
              setAuto(true);
              setPhase('run');
            }}
          />
        </>
      }>
      <ArtCaption tone="brand" style={{ alignSelf: 'flex-start' }}>KIP RUN · INFLATION CHASE</ArtCaption>
      <SpeechBubble text="Your turn! Grab coins, bank them at green INVEST gates before The Melt (inflation) shrinks them, and dodge the SALE signs, fees and hot tips." speaker="Kip" />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginVertical: space(1) }}>
        <Character name="kip" pose="full" size={170} />
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Character name="melt" mood="worry" size={118} />
          <ArtCaption tone="brand">The Melt = inflation</ArtCaption>
        </View>
      </View>
      <ArtCaption>Swipe ← → to switch lanes · ↑ to jump · ↓ to slide</ArtCaption>
    </OnboardingFrame>
  );
}
