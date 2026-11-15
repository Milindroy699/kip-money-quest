/**
 * Home: your status (streak, coins, FinIQ, Future You), the world you're in with its next lesson
 * (Money Town, World 0, lives here; Worlds 1–9 are on the campus map behind the hero button),
 * today's nudges as a swipeable row of cards, and a one-tap Kip Run.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { newSpots, type SpotContext } from '@/campus/map';
import { useCampusSeen } from '@/campus/seen';
import { skinFor } from '@/campus/skins';
import { nextLesson, trackFor, WORLDS, type Track } from '@/content';
import { quizUnlocked } from '@/content/unlocks';
import { allContentComplete, planUnlocks, seasonComplete } from '@/engagement/plan';
import { dueReviews } from '@/engagement/review';
import { canClaimDividend, COMEBACK_BONUS, comebackBonus, finIQBand, REWARDED_RUNS_PER_DAY } from '@/engagement/rewards';
import { displayStreak, streakMultiplier, streakStatus } from '@/engagement/streak';
import { todayNudges } from '@/engagement/today';
import { useNudgePermission } from '@/engagement/useNudgePermission';
import { NudgeCarousel } from '@/home/NudgeCarousel';
import { QuickRunCard } from '@/home/QuickRunCard';
import { WorldHero } from '@/home/WorldHero';
import { WorldPath, pathStyles } from '@/lessons/WorldPath';
import { useGame } from '@/state/game';
import { Backdrop } from '@/ui/Backdrop';
import { Card, Chip, Screen, StatBar } from '@/ui/components';
import { DailyGoalRing } from '@/ui/DailyGoalRing';
import { PlanCard } from '@/ui/PlanCard';
import { colors, radius, shadow, space, type } from '@/ui/theme';

const MONEY_TOWN = WORLDS[0];

export default function Home() {
  const profile = useGame((s) => s.profile);
  const streak = useGame((s) => s.streak);
  const coins = useGame((s) => s.coins);
  const lessons = useGame((s) => s.lessons);
  const lastDividendDay = useGame((s) => s.lastDividendDay);
  const portfolio = useGame((s) => s.portfolio);
  const today = useGame((s) => s.today());
  const finiq = useGame((s) => s.finIQ());
  const minutesToday = useGame((s) => s.dailyToday().minutes);
  const seen = useCampusSeen((s) => s.seen);
  const reminders = useNudgePermission();
  const quizPlayed = useGame((s) => s.quiz?.played ?? 0);
  const quizzesToday = useGame((s) => s.dailyToday().quizzes ?? 0);
  const runsToday = useGame((s) => s.dailyToday().runs);
  const bestRun = useGame((s) => s.runs.bestScore);

  const status = streakStatus(streak, today);
  const shown = displayStreak(streak, today);
  const track = trackFor(profile.ageBand);
  const skin = skinFor(track);
  const current = nextLesson(lessons, track);
  const band = finIQBand(finiq);
  const reviewsDue = dueReviews(lessons, today).length;
  const dividendReady = canClaimDividend(lastDividendDay, today);
  const townDone = MONEY_TOWN.lessons.every((l) => lessons[l.id]);
  const everything = allContentComplete(lessons, track);
  const quizOpen = quizUnlocked(lessons);

  const spotCtx: SpotContext = { completed: lessons, reviewsDue, dividendReady, dividendClaimedBefore: lastDividendDay !== null, portfolioStarted: portfolio.lots.length > 0 };
  const h = portfolio.history;
  const portfolioMove = portfolio.lots.length && h.length >= 2 && h[h.length - 2].value > 0 ? h[h.length - 1].value / h[h.length - 2].value - 1 : null;
  const nudges = todayNudges({
    newSpots: newSpots(spotCtx, seen).map((id) => ({ id, ...skin.spots[id] })),
    mapTitle: skin.title,
    dividendReady: dividendReady && (!!lessons['w0-l4'] || lastDividendDay !== null),
    reviewsDue,
    remindersOff: reminders.status === 'off',
    portfolioMove,
    quizNew: quizOpen && quizPlayed === 0,
    quizSuggest: quizOpen && quizPlayed > 0 && quizzesToday === 0,
  });

  return (
    <Backdrop art={skin.id === 'campus' ? 'homeCampus' : 'homeIsland'} scrim="soft">
      <Screen style={{ backgroundColor: 'transparent' }}>
        <StatBar streak={shown} coins={coins} finiq={finiq} atRisk={status === 'at-risk'} />
        <ScrollView contentContainerStyle={{ padding: space(2.5), paddingTop: space(1), gap: space(2), paddingBottom: space(6) }}>
          {seasonComplete(lessons) && !everything ? (
            <Pressable onPress={() => router.push('/plan')} accessibilityRole="button" accessibilityLabel="Season 1 complete. See your money plan.">
              <View style={{ backgroundColor: colors.ink, borderRadius: radius.lg, padding: space(2), gap: 6, ...shadow }}>
                <Text style={[type.tiny, { color: colors.coin }]}>🏆 SEASON 1 COMPLETE</Text>
                <Text style={[type.h2, { color: '#fff' }]}>Your first money plan is ready</Text>
                <Text style={[type.small, { color: '#DCE3EE' }]}>Season 2 is open on {skin.title}: risk, products, and building your own mix.</Text>
                <Text style={[type.bodyBold, { color: colors.kip }]}>See my plan ›</Text>
              </View>
            </Pressable>
          ) : null}

          {current ? <WorldHero lesson={current} lessons={lessons} track={track} /> : null}

          <StreakCard status={status} streak={shown} freezes={streak.freezes} minutes={minutesToday} goal={profile.dailyGoalMin} welcomeBonus={comebackBonus(streak.lastActiveDay, today) > 0} />

          {nudges.length ? <NudgeCarousel nudges={nudges} skin={skin.id} onTurnOnReminders={reminders.turnOn} /> : null}

          <QuickRunCard streakOpen={status === 'at-risk' || status === 'none' || status === 'broken'} best={bestRun} runsLeft={Math.max(REWARDED_RUNS_PER_DAY - runsToday, 0)} />

          <PlanCard profile={profile} unlocks={planUnlocks(lessons)} finiq={finiq} compact />
          <Text style={[type.tiny, pathStyles.pill, { alignSelf: 'flex-start', marginTop: -8 }]}>
            FinIQ {finiq} · {band.name} band
          </Text>

          {everything ? (
            <Pressable onPress={() => router.push('/plan')} accessibilityRole="button" accessibilityLabel="Every world complete. See your Launch Plan.">
              <View style={{ backgroundColor: colors.ink, borderRadius: radius.lg, padding: space(2), gap: 6, ...shadow }}>
                <Text style={[type.tiny, { color: colors.coin }]}>🚀 EVERY WORLD COMPLETE</Text>
                <Text style={[type.h2, { color: '#fff' }]}>You finished Kip: Money Quest</Text>
                <Text style={[type.small, { color: '#DCE3EE' }]}>
                  {track === 'explorer'
                    ? 'Ready for more? Switch to the Builder track in You to open Three Doors, Time Tracks and Analyst HQ.'
                    : `Keep your streak going with reviews, Kip Run, duels and your Practice Portfolio on ${skin.title}.`}
                </Text>
                <Text style={[type.bodyBold, { color: colors.kip }]}>See my Launch Plan ›</Text>
              </View>
            </Pressable>
          ) : null}

          {townDone ? <MoneyTownDone lessons={lessons} track={track} currentId={current?.id} /> : null}

          <Text style={[type.tiny, pathStyles.pill, { alignSelf: 'center' }]}>Streak boost today: ×{streakMultiplier(Math.max(shown, 1)).toFixed(2)} XP</Text>
        </ScrollView>
      </Screen>
    </Backdrop>
  );
}

/** Once Money Town is finished it folds into one line that can open again for revisits. */
function MoneyTownDone({ lessons, track, currentId }: { lessons: Record<string, { accuracy: number }>; track: Track; currentId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: space(1.5) }}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel={`Money Town complete. ${open ? 'Hide' : 'Show'} lessons.`}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5), backgroundColor: MONEY_TOWN.color, borderRadius: radius.lg, padding: space(1.5), ...shadow }}>
          <Text style={{ fontSize: 24 }}>🏘️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[type.tiny, { color: 'rgba(255,255,255,0.9)' }]}>WORLD 0 · COMPLETE ✓</Text>
            <Text style={[type.bodyBold, { color: '#fff' }]}>Money Town</Text>
          </View>
          <Text style={[type.small, { color: '#fff', fontWeight: '800' }]}>{open ? 'Hide' : 'Revisit'}</Text>
        </View>
      </Pressable>
      {open ? <WorldPath world={MONEY_TOWN} lessons={lessons} currentId={currentId} track={track} /> : null}
    </View>
  );
}

function StreakCard({ status, streak, freezes, minutes, goal, welcomeBonus }: { status: ReturnType<typeof streakStatus>; streak: number; freezes: number; minutes: number; goal: number; welcomeBonus: boolean }) {
  const copy = {
    none: { title: 'Start your Knowledge SIP', text: 'Finish one lesson or run today to make your first deposit.', color: colors.kip },
    'done-today': { title: `🔥 ${streak}-day Knowledge SIP`, text: "Today's deposit is in. Your XP boost compounds 1% a day.", color: colors.kip },
    'at-risk': { title: `🔥 ${streak} days and rolling`, text: 'One quick lesson keeps your snowball growing today.', color: colors.dash },
    protected: { title: '🛡️ Emergency fund ready', text: 'You missed a day, but a freeze will cover it when you play today.', color: colors.melt },
    broken: welcomeBonus
      ? { title: 'Welcome back! 🐢 Kip saved your seat', text: `No judgement. Finish one lesson, review or run today for a +${COMEBACK_BONUS} coin welcome-back bonus. Your knowledge stayed.`, color: colors.kip }
      : { title: 'Welcome back! 🐢', text: 'Your streak reset, like a SIP after a withdrawal. Your knowledge stayed. Let’s restart the snowball.', color: colors.melt },
  }[status];
  return (
    <Card style={{ borderColor: copy.color, flexDirection: 'row', gap: space(1.5), alignItems: 'center' }}>
      <DailyGoalRing minutes={minutes} goal={goal} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[type.bodyBold, { flex: 1 }]}>{copy.title}</Text>
          <Pressable onPress={() => router.push('/freeze')} accessibilityRole="button" accessibilityLabel="Emergency fund freezes">
            <Chip label={`🛡️ ${freezes}/2`} />
          </Pressable>
        </View>
        <Text style={type.small}>{minutes >= goal ? `Daily goal met (${goal} min). ${copy.text}` : `Today: ${Math.min(minutes, goal)} of ${goal} min. ${copy.text}`}</Text>
      </View>
    </Card>
  );
}
