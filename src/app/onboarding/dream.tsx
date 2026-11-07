/** Onboarding 2/6 — What's your dream? Goal + target age, foggy Future You. */
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { OnboardingFrame } from '@/onboarding/OnboardingFrame';
import { useGame } from '@/state/game';
import { Button, Card } from '@/ui/components';
import { FutureYouLabel, FutureYouPortrait, GOALS } from '@/ui/FutureYou';
import { GoalAgePicker } from '@/ui/GoalAgePicker';
import { colors, radius, space, type } from '@/ui/theme';

export default function Dream() {
  const profile = useGame((s) => s.profile);
  const setProfile = useGame((s) => s.setProfile);
  const age = profile.age ?? 15;
  const [priceText, setPriceText] = useState(profile.goalPrice ? String(profile.goalPrice) : '');
  const commitPrice = () => {
    const v = Number(priceText);
    if (v >= 1000) setProfile({ goalPrice: Math.min(v, 100000000) });
  };

  return (
    <OnboardingFrame step={2} footer={<Button testID="dream-continue" title="Continue" disabled={!profile.goal} onPress={() => {
            commitPrice();
            router.push('/onboarding/magic');
          }} />}>
      <Text style={type.title}>What’s your dream, {profile.name || 'friend'}?</Text>
      <Text style={type.body}>Pick one. We’ll build toward it together.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(1.5) }}>
        {GOALS.map((g) => {
          const active = profile.goal === g.id;
          return (
            <Pressable
              key={g.id}
              style={{ width: '47.5%' }}
              onPress={() => {
                setProfile({ goal: g.id, goalPrice: g.price });
                setPriceText(String(g.price));
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}>
              <View style={{ padding: space(2), borderRadius: radius.lg, borderWidth: 2.5, borderBottomWidth: 5, borderColor: active ? colors.kip : colors.line, backgroundColor: active ? colors.kipLight : colors.surface, alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 36 }}>{g.emoji}</Text>
                <Text style={type.bodyBold}>{g.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {profile.goal ? (
        <>
          <Text style={type.h2}>Roughly what does it cost today?</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, paddingHorizontal: space(2) }}>
            <Text style={[type.title, { color: colors.inkSoft }]}>₹</Text>
            <TextInput
              testID="goal-price"
              value={priceText}
              onChangeText={(t) => setPriceText(t.replace(/[^0-9]/g, ''))}
              onEndEditing={commitPrice}
              onBlur={commitPrice}
              keyboardType="number-pad"
              returnKeyType="done"
              accessibilityLabel="Goal price in rupees"
              style={[type.title, { flex: 1, paddingVertical: space(1.5), paddingHorizontal: space(1) }]}
            />
          </View>
          <Text style={type.tiny}>A guess is fine. You can change it any time in your plan.</Text>
        </>
      ) : null}
      <Text style={type.h2}>By what age?</Text>
      <GoalAgePicker age={age} value={profile.targetAge} onChange={(targetAge) => setProfile({ targetAge })} testID="dream-goal-age" />
      {profile.goal ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <FutureYouPortrait clarity={0} goal={profile.goal} size={84} />
            <FutureYouLabel age={profile.targetAge} />
          </View>
          <Text style={[type.body, { flex: 1 }]}>Your future is still misty. Every lesson brings it into focus, richer and wiser.</Text>
        </Card>
      ) : null}
    </OnboardingFrame>
  );
}
