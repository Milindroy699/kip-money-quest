/** Onboarding 5/6 — first cards earned, FinIQ 300 → 320. */
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import { CARDS, getCard, STARTER_CARDS } from '@/content';
import { AssetCard } from '@/game/cards/AssetCard';
import { OnboardingFrame } from '@/onboarding/OnboardingFrame';
import { useGame } from '@/state/game';
import { ArtCaption, Button, Card, CountUp, ProgressBar } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';
import { ONBOARDING_FINIQ_BONUS } from '@/engagement/rewards';

export default function FirstCards() {
  const grantStarterCards = useGame((s) => s.grantStarterCards);
  const [flips] = useState(() => STARTER_CARDS.map(() => new Animated.Value(0)));

  useEffect(() => {
    grantStarterCards();
    Animated.stagger(
      350,
      flips.map((v) => Animated.spring(v, { toValue: 1, useNativeDriver: true, friction: 6 })),
    ).start();
  }, [grantStarterCards, flips]);

  return (
    <OnboardingFrame step={5} footer={<Button testID="collect-cards" title="Collect" onPress={() => router.push('/onboarding/commit')} />}>
      <Text style={[type.title, { textAlign: 'center' }]}>Your first cards! 🎉</Text>
      <View style={{ flexDirection: 'row', gap: space(1.5) }}>
        {STARTER_CARDS.map((id, i) => {
          const card = getCard(id)!;
          return (
            <Animated.View
              key={id}
              style={{
                flex: 1,
                opacity: flips[i],
                transform: [{ perspective: 800 }, { rotateY: flips[i].interpolate({ inputRange: [0, 1], outputRange: ['90deg', '0deg'] }) }, { scale: flips[i].interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
              }}>
              <AssetCard card={card} compact isNew />
            </Animated.View>
          );
        })}
      </View>
      <ArtCaption>Collect all {CARDS.length} cards by learning. No luck, no loot boxes: every card is earned.</ArtCaption>
      <Card style={{ alignItems: 'center', gap: space(1) }}>
        <Text style={type.small}>Your FinIQ (money-literacy score)</Text>
        <CountUp from={300} to={300 + ONBOARDING_FINIQ_BONUS} duration={1400} style={[type.hero, { color: colors.kipDark }]} />
        <View style={{ alignSelf: 'stretch' }}>
          <ProgressBar value={ONBOARDING_FINIQ_BONUS / 600} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={type.tiny}>300</Text>
            <Text style={type.tiny}>900</Text>
          </View>
        </View>
        <Text style={[type.small, { textAlign: 'center' }]}>Starter band. Like a credit score, but for what you know. Let’s grow it!</Text>
      </Card>
    </OnboardingFrame>
  );
}
