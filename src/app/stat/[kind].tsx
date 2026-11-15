/**
 * What the chips in the top bar mean, and what to do about them: the streak (your Knowledge SIP),
 * coins (how you earn and use them) and FinIQ (your band and how to grow it).
 */
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { nextLesson, trackFor } from '@/content';
import { activeInLast7, displayStreak, FREEZE_COST, MAX_FREEZES, streakMultiplier, streakStatus } from '@/engagement/streak';
import { canClaimDividend, daysUntilDividend, FINIQ_BANDS, finIQBand, finIQBandProgress, REWARDED_RUNS_PER_DAY, RUN_COIN_CAP } from '@/engagement/rewards';
import { Character } from '@/mascot/Character';
import { useGame } from '@/state/game';
import { Button, Card, Coin, ProgressBar } from '@/ui/components';
import { DailyGoalRing } from '@/ui/DailyGoalRing';
import { colors, space, type } from '@/ui/theme';

type Kind = 'streak' | 'coins' | 'finiq';

export default function StatSheet() {
  const { kind } = useLocalSearchParams<{ kind: Kind }>();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.cream }} contentContainerStyle={{ padding: space(2.5), paddingBottom: insets.bottom + space(4), gap: space(2) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: colors.ink }}>✕</Text>
        </Pressable>
      </View>
      {kind === 'coins' ? <Coins /> : kind === 'finiq' ? <FinIQ /> : <Streak />}
    </ScrollView>
  );
}

function Streak() {
  const streak = useGame((s) => s.streak);
  const today = useGame((s) => s.today());
  const minutes = useGame((s) => s.dailyToday().minutes);
  const goal = useGame((s) => s.profile.dailyGoalMin);
  const lessons = useGame((s) => s.lessons);
  const ageBand = useGame((s) => s.profile.ageBand);
  const status = streakStatus(streak, today);
  const shown = displayStreak(streak, today);
  const next = nextLesson(lessons, trackFor(ageBand));
  const boost = streakMultiplier(shown);
  const line =
    status === 'done-today'
      ? 'Today’s deposit is in. See you tomorrow!'
      : status === 'at-risk'
        ? 'Make today’s deposit to keep it growing: one lesson or one run.'
        : status === 'protected'
          ? 'A freeze is covering your missed day. Come back today to keep it.'
          : status === 'broken'
            ? 'Your streak reset. Every streak starts at day 1, so start a new one today.'
            : 'Do one lesson or one run to start your streak.';
  return (
    <>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 64 }}>🔥</Text>
        <Text style={type.title}>
          {shown} {shown === 1 ? 'day' : 'days'}
        </Text>
        <Text style={[type.body, { textAlign: 'center' }]}>{line}</Text>
      </View>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
        <DailyGoalRing minutes={minutes} goal={goal} size={64} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={type.bodyBold}>
            Today: {Math.min(minutes, goal)} of {goal} min
          </Text>
          <Text style={type.small}>Your streak is a Knowledge SIP: a small deposit every day that compounds.</Text>
        </View>
      </Card>
      <View style={{ flexDirection: 'row', gap: space(1.5) }}>
        <Tile big={`×${boost.toFixed(2)}`} small="XP boost" note="+1% a day, up to ×1.5" />
        <Tile big={`${streak.longest}`} small="Best streak" />
        <Tile big={`${activeInLast7(streak, today)}/7`} small="Days this week" />
      </View>
      <Card style={{ gap: space(1) }}>
        <Text style={type.bodyBold}>
          🛡️ Freezes: {streak.freezes} / {MAX_FREEZES}
        </Text>
        <Text style={type.small}>A freeze covers one missed day, like an emergency fund. They cost {FREEZE_COST} coins.</Text>
        <Button title={streak.freezes >= MAX_FREEZES ? 'Freezes full' : 'Get a freeze'} variant="secondary" disabled={streak.freezes >= MAX_FREEZES} onPress={() => router.replace('/freeze')} />
      </Card>
      {status !== 'done-today' && next ? <Button title={`Keep it going: ${next.title}`} onPress={() => router.replace(`/lesson/${next.id}`)} /> : null}
    </>
  );
}

function Coins() {
  const coins = useGame((s) => s.coins);
  const lastDividendDay = useGame((s) => s.lastDividendDay);
  const today = useGame((s) => s.today());
  // Dividend Day opens with the Campus Bank, after Money Town (same rule as the map and Home).
  const bankOpen = useGame((s) => !!s.lessons['w0-l4'] || s.lastDividendDay !== null);
  const ready = bankOpen && canClaimDividend(lastDividendDay, today);
  return (
    <>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Coin size={64} />
        <Text style={type.title}>{coins} coins</Text>
        <Text style={[type.body, { textAlign: 'center' }]}>Game coins you earn by learning. They’re never bought with real money.</Text>
      </View>
      <Card style={{ gap: 8 }}>
        <Text style={type.h2}>How you earn them</Text>
        <Row emoji="📘" text="Lessons: more for a perfect score" />
        <Row emoji="🏃" text={`Kip Run: up to ${RUN_COIN_CAP} a run, for your first ${REWARDED_RUNS_PER_DAY} runs a day`} />
        <Row
          emoji="💰"
          text={!bankOpen ? 'Dividend Day: a weekly reward that opens when you finish Money Town' : ready ? 'Dividend Day: ready to collect now!' : `Dividend Day: every week (next in ${daysUntilDividend(lastDividendDay, today)} days)`}
        />
        <Row emoji="⚔️" text="Market Duels and coming back after a break" />
      </Card>
      <Card style={{ gap: 8 }}>
        <Text style={type.h2}>What they’re for</Text>
        <Row emoji="📈" text="Invest them in the Practice Portfolio and watch them grow (or dip)" />
        <Row emoji="🛡️" text={`Streak freezes: ${FREEZE_COST} coins each`} />
      </Card>
      <View style={{ gap: space(1) }}>
        {ready ? <Button title="Collect Dividend Day" onPress={() => router.replace('/dividend')} /> : null}
        <Button title="Practice Portfolio" variant={ready ? 'secondary' : 'primary'} onPress={() => router.replace('/portfolio')} />
      </View>
    </>
  );
}

function FinIQ() {
  const score = useGame((s) => s.finIQ());
  const band = finIQBand(score);
  const nextBand = FINIQ_BANDS[FINIQ_BANDS.indexOf(band) + 1];
  return (
    <>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Character name="kip" mood="cheer" size={110} />
        <Text style={[type.title, { color: colors.kipDark }]}>FinIQ {score}</Text>
        <Text style={[type.body, { textAlign: 'center' }]}>Your money-literacy score, from 300 to 900. Like a credit score, but for what you know.</Text>
      </View>
      <Card style={{ gap: space(1) }}>
        <Text style={type.bodyBold}>{band.name} band</Text>
        <Text style={type.small}>{band.blurb}</Text>
        <ProgressBar value={finIQBandProgress(score)} />
        <Text style={type.tiny}>{nextBand ? `${nextBand.min - score} points to ${nextBand.name}: ${nextBand.blurb.charAt(0).toLowerCase()}${nextBand.blurb.slice(1)}` : 'Top band. Keep it sharp with reviews.'}</Text>
      </Card>
      <Card style={{ gap: 8 }}>
        <Text style={type.h2}>How it grows</Text>
        <Row emoji="📘" text="Finish lessons, and get the questions right" />
        <Row emoji="📚" text="Do your reviews, so what you learned sticks" />
        <Row emoji="🏆" text="Beat each world’s boss lesson" />
      </Card>
      <View style={{ gap: 6 }}>
        {FINIQ_BANDS.map((b) => (
          <View key={b.name} style={{ flexDirection: 'row', alignItems: 'center', gap: space(1), opacity: score >= b.min ? 1 : 0.5 }}>
            <Text style={{ fontSize: 16 }}>{score >= b.min ? '✅' : '⬜️'}</Text>
            <Text style={[type.small, { flex: 1 }]}>
              <Text style={{ fontWeight: '800', color: colors.ink }}>
                {b.name} ({b.min}+):
              </Text>{' '}
              {b.blurb}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

function Tile({ big, small, note }: { big: string; small: string; note?: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', padding: space(1.5), gap: 2 }}>
      <Text style={type.h2}>{big}</Text>
      <Text style={[type.tiny, { textAlign: 'center' }]}>{small}</Text>
      {note ? <Text style={[type.tiny, { textAlign: 'center', fontSize: 10 }]}>{note}</Text> : null}
    </Card>
  );
}

function Row({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: space(1), alignItems: 'flex-start' }}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text style={[type.small, { flex: 1 }]}>{text}</Text>
    </View>
  );
}
