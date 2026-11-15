/**
 * The player's first money plan (mini Launch Plan). It unlocks fully at the end of Season 1 (World 2)
 * and can be shared with a parent. Before that, it shows which pieces are still locked.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { planUnlocks } from '@/engagement/plan';
import { Character } from '@/mascot/Character';
import { friendlyRupees, HYPOTHETICAL_LABEL } from '@/sim';
import { useGame } from '@/state/game';
import { Backdrop } from '@/ui/Backdrop';
import { Button, Card, HypotheticalLabel, SectionTitle } from '@/ui/components';
import { goalOf } from '@/ui/FutureYou';
import { planForProfile } from '@/ui/PlanCard';
import { colors, formatINR, radius, space, type } from '@/ui/theme';
import { GoalAgePicker } from '@/ui/GoalAgePicker';

const HABITS = [
  'Build an emergency fund first (3 months of spending in a savings account).',
  'Automate it: set the SIP for the day your money arrives.',
  'Don’t withdraw early. Let the snowball roll.',
  'Check the plan once a year and raise the amount when your income grows.',
];

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const profile = useGame((s) => s.profile);
  const lessons = useGame((s) => s.lessons);
  const setProfile = useGame((s) => s.setProfile);
  const unlocks = planUnlocks(lessons);
  const goal = goalOf(profile.goal);
  const plan = planForProfile(profile);
  const [priceText, setPriceText] = useState(String(profile.goalPrice ?? goal.price));
  const age = profile.age ?? 15;
  const monthly = friendlyRupees(plan.monthlyInvested);

  const share = () => {
    const message = [
      `My first money plan (from Kip: Money Quest) 🐢`,
      `Goal: ${goal.label} by age ${profile.targetAge}`,
      `Costs ${formatINR(plan.priceToday)} today, about ${formatINR(plan.priceAtGoal)} by then (6% inflation).`,
      `Plan: about ${formatINR(monthly)} a month into: ${plan.product}.`,
      `Same goal from cash in a drawer: ${formatINR(friendlyRupees(plan.monthlyCash))} a month.`,
      `Habits: emergency fund first, automate it, don't withdraw early.`,
      HYPOTHETICAL_LABEL,
    ].join('\n');
    Share.share({ message }).catch(() => {});
  };

  return (
    <Backdrop art="onboarding" scrim="soft">
      <ScrollView contentContainerStyle={{ padding: space(2.5), paddingTop: insets.top + space(1), paddingBottom: insets.bottom + space(4), gap: space(2) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={type.title}>{unlocks.launchPlan ? 'Your first money plan' : 'Your plan so far'}</Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
            <Text style={{ fontSize: 26, color: colors.inkMuted }}>✕</Text>
          </Pressable>
        </View>

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5) }}>
          <Character name="kip" pose="full" size={96} />
          <View style={{ flex: 1 }}>
            <Text style={type.tiny}>GOAL</Text>
            <Text style={type.h2}>
              {goal.emoji} {goal.label}
            </Text>
            <Text style={type.small}>
              By age {profile.targetAge} · {plan.years} {plan.years === 1 ? 'year' : 'years'} from now
            </Text>
          </View>
        </Card>

        <Card style={{ gap: space(1.5) }}>
          <SectionTitle>The numbers</SectionTitle>
          <Row label="Price today" value={formatINR(plan.priceToday)} />
          <Row label={`Price at ${profile.targetAge} (6% inflation)`} value={formatINR(plan.priceAtGoal)} locked={!unlocks.priceAtGoal} hint="Finish The Melt to unlock" />
          <Row label="Invest each month" value={`${formatINR(monthly)}`} locked={!unlocks.monthly} hint="Finish “SIP: investing on autopilot”" big />
          <Row label="Cash in a drawer instead" value={`${formatINR(friendlyRupees(plan.monthlyCash))}`} locked={!unlocks.monthly} hint="" />
          {plan.costOfWaiting > 0 ? (
            <Row label="Start 3 years later and you need" value={`+${formatINR(friendlyRupees(plan.costOfWaiting))} / month`} locked={!unlocks.monthly} hint="" />
          ) : null}
          <Row label="Where to put it" value={plan.product} locked={!unlocks.launchPlan} hint="Finish Snowball Valley" />
          {unlocks.launchPlan ? <Text style={type.small}>{plan.why}</Text> : null}
          <HypotheticalLabel extra={`Assumes a hypothetical ${Math.round(plan.rate * 100)}% a year.`} />
        </Card>

        {unlocks.launchPlan ? (
          <>
            <Card style={{ gap: space(1) }}>
              <SectionTitle>Habits that make it work</SectionTitle>
              {HABITS.map((h) => (
                <Text key={h} style={type.body}>
                  ✅ {h}
                </Text>
              ))}
            </Card>
            <Card style={{ gap: space(1), backgroundColor: colors.dashLight, borderColor: colors.dash }}>
              <SectionTitle>Talk it through with a parent</SectionTitle>
              <Text style={type.body}>• Can we open a savings account or SIP in my name, with you as guardian?</Text>
              <Text style={type.body}>• How much could I put in each month from pocket money or earnings?</Text>
              <Text style={type.body}>• What do you invest in, and why?</Text>
            </Card>
            <Button title="Share my plan" onPress={share} />
          </>
        ) : (
          <Card style={{ alignItems: 'center', gap: 6 }}>
            <Text style={type.bodyBold}>Your full Launch Plan unlocks when you finish Snowball Valley.</Text>
            <Text style={[type.small, { textAlign: 'center' }]}>Every world you finish reveals another piece of your plan.</Text>
          </Card>
        )}

        <Card style={{ gap: space(1.5) }}>
          <SectionTitle>Edit your goal</SectionTitle>
          <Text style={type.small}>Price today (₹)</Text>
          <TextInput
            value={priceText}
            onChangeText={(t) => setPriceText(t.replace(/[^0-9]/g, ''))}
            onEndEditing={() => {
              const v = Math.min(Math.max(Number(priceText) || goal.price, 1000), 100000000);
              setPriceText(String(v));
              setProfile({ goalPrice: v });
            }}
            keyboardType="number-pad"
            returnKeyType="done"
            accessibilityLabel="Goal price in rupees"
            style={[type.bodyBold, { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, padding: space(1.5), fontSize: 18 }]}
          />
          <Text style={type.small}>By what age?</Text>
          <GoalAgePicker age={age} value={profile.targetAge} onChange={(targetAge) => setProfile({ targetAge })} testID="plan-goal-age" />
        </Card>
      </ScrollView>
    </Backdrop>
  );
}

function Row({ label, value, locked, hint, big }: { label: string; value: string; locked?: boolean; hint?: string; big?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <Text style={[type.small, { flex: 1, color: colors.inkSoft }]}>{label}</Text>
      {locked ? (
        <Text style={[type.tiny, { color: colors.inkMuted, maxWidth: '50%', textAlign: 'right' }]}>🔒 {hint || 'Locked'}</Text>
      ) : (
        <Text style={[big ? type.title : type.bodyBold, { color: big ? colors.kipDark : colors.ink, maxWidth: '55%', textAlign: 'right' }]}>{value}</Text>
      )}
    </View>
  );
}
