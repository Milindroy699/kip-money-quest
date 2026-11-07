/** The Future You plan: the player's own goal, with each number revealed by finishing a world. */
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { PlanUnlocks } from '../engagement/plan';
import { friendlyRupees, makeGoalPlan, riskMixFor, type GoalPlan } from '../sim';
import type { Profile } from '../state/game';
import { Card, ProgressBar } from './components';
import { clarityFromFinIQ, FutureYouPortrait, goalOf } from './FutureYou';
import { colors, formatINR, space, type } from './theme';

export function planForProfile(profile: Profile): GoalPlan {
  const goal = goalOf(profile.goal);
  return makeGoalPlan(profile.goalPrice ?? goal.price, profile.age ?? 15, profile.targetAge);
}

function Line({ label, value, locked, hint }: { label: string; value: string; locked: boolean; hint: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingVertical: 4 }}>
      <Text style={[type.small, { color: colors.inkSoft, flex: 1 }]}>{label}</Text>
      {locked ? (
        <Text style={[type.tiny, { color: colors.inkMuted }]} numberOfLines={1}>
          🔒 {hint}
        </Text>
      ) : (
        <Text style={[type.bodyBold, { color: colors.ink }]}>{value}</Text>
      )}
    </View>
  );
}

export function PlanCard({ profile, unlocks, finiq, compact }: { profile: Profile; unlocks: PlanUnlocks; finiq: number; compact?: boolean }) {
  const goal = goalOf(profile.goal);
  const plan = planForProfile(profile);
  const revealed = [true, unlocks.priceAtGoal, unlocks.monthly, unlocks.launchPlan, unlocks.riskMix].filter(Boolean).length;
  const mix = riskMixFor(plan.years);
  return (
    <Pressable onPress={() => router.push('/plan')} accessibilityRole="button" accessibilityLabel={`Your Future You plan: ${goal.label} by ${profile.targetAge}. Open plan.`}>
      <Card style={{ gap: space(1) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5) }}>
          <FutureYouPortrait clarity={clarityFromFinIQ(finiq)} goal={profile.goal} size={compact ? 56 : 72} />
          <View style={{ flex: 1 }}>
            <Text style={type.tiny}>
              YOUR PLAN · {profile.ageBand === '16-19' ? 'BUILDER' : 'EXPLORER'} TRACK
            </Text>
            <Text style={type.bodyBold}>
              {goal.emoji} {goal.label} by {profile.targetAge}
            </Text>
            <View style={{ marginTop: 4 }}>
              <ProgressBar value={revealed / 5} height={6} />
            </View>
          </View>
          <Text style={[type.h2, { color: colors.inkMuted }]}>›</Text>
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 4 }}>
          <Line label="Price today" value={formatINR(plan.priceToday)} locked={false} hint="" />
          <Line label={`Price at ${profile.targetAge}`} value={formatINR(plan.priceAtGoal)} locked={!unlocks.priceAtGoal} hint="Finish The Melt" />
          <Line label="Monthly plan" value={`${formatINR(friendlyRupees(plan.monthlyInvested))} / month`} locked={!unlocks.monthly} hint="Learn about SIPs" />
          {!compact ? <Line label="Where to put it" value={plan.product} locked={!unlocks.launchPlan} hint="Finish Snowball Valley" /> : null}
          {!compact ? (
            <Line label="Risk mix" value={`${mix.safe}% safe · ${mix.balanced}% balanced${mix.wild ? ` · ${mix.wild}% wild` : ''}`} locked={!unlocks.riskMix} hint="Finish Risk Ridge" />
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
