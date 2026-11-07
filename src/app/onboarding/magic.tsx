/** Onboarding 3/6 — the magic moment, personal: the player's own goal, Kip's plan vs Dash's. */
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { ConceptWidget } from '@/lessons/widgets';
import { Character } from '@/mascot/Character';
import { OnboardingFrame } from '@/onboarding/OnboardingFrame';
import { friendlyRupees } from '@/sim';
import { useGame } from '@/state/game';
import { ArtCaption, Button, Card } from '@/ui/components';
import { goalOf } from '@/ui/FutureYou';
import { planForProfile } from '@/ui/PlanCard';
import { colors, formatINR, space, type } from '@/ui/theme';

export default function Magic() {
  const profile = useGame((s) => s.profile);
  const [done, setDone] = useState(false);
  const onDone = useCallback(() => setDone(true), []);
  const goal = goalOf(profile.goal);
  const plan = planForProfile(profile);
  const kip = friendlyRupees(plan.monthlyInvested);
  const dash = friendlyRupees(plan.monthlyCash);

  const step = {
    type: 'concept' as const,
    widget: 'compoundChart' as const,
    title: 'Kip vs Dash',
    params: { mode: 'kipVsDash', monthly: kip, rate: plan.rate, inflation: plan.inflation, maxYears: Math.max(plan.years, 5) },
  };

  return (
    <OnboardingFrame step={3} footer={<Button testID="magic-continue" title={done ? 'Whoa. Show me how' : 'Drag the years to see'} disabled={!done} onPress={() => router.push('/onboarding/run')} />}>
      <Text style={type.small}>YOUR DREAM</Text>
      <Text style={type.title}>
        {goal.emoji} {goal.label} by {profile.targetAge}
      </Text>
      <Text style={type.body}>
        It costs {formatINR(plan.priceToday)} today, but prices rise. By {profile.targetAge} it will cost about <Text style={type.bodyBold}>{formatINR(plan.priceAtGoal)}</Text>.
      </Text>
      <View style={{ flexDirection: 'row', gap: space(1.5) }}>
        <Card style={{ flex: 1, alignItems: 'center', padding: space(1.5), borderColor: colors.dash, gap: 2 }}>
          <Character name="dash" mood="happy" size={72} />
          <Text style={[type.bodyBold, { color: colors.dashDark }]}>Dash saves cash</Text>
          <Text style={[type.title, { color: colors.ink }]}>{formatINR(dash)}</Text>
          <Text style={[type.tiny, { textAlign: 'center' }]}>a month, in a drawer</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', padding: space(1.5), borderColor: colors.kip, gap: 2 }}>
          <Character name="kip" mood="happy" size={72} />
          <Text style={[type.bodyBold, { color: colors.kipDark }]}>Kip invests</Text>
          <Text style={[type.title, { color: colors.kipDark }]}>{formatINR(kip)}</Text>
          <Text style={[type.tiny, { textAlign: 'center' }]}>a month, in a SIP</Text>
        </Card>
      </View>
      <ArtCaption>Same goal. Now drag the years and watch {formatINR(kip)} a month grow.</ArtCaption>
      <ConceptWidget step={step} onDone={onDone} />
      {done ? (
        <Card style={{ backgroundColor: colors.kipLight, borderColor: colors.kip }}>
          <Text style={type.bodyBold}>Kip needs {dash > kip ? `${formatINR(dash - kip)} less every month` : 'less'} than Dash.</Text>
          <Text style={[type.body, { marginTop: 4 }]}>Kip’s money works too (compounding). Dash’s cash just sits there while The Melt eats it. The Melt is inflation: prices rise a little every year, so the same rupees buy less. Ready to feel it?</Text>
        </Card>
      ) : null}
    </OnboardingFrame>
  );
}
