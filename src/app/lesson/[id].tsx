/** Lesson route: plays the lesson, then shows the reward screen. */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { signInOffered } from '@/account/config';
import { shouldOfferSave } from '@/account/prime';
import { WORLD_BACKGROUND } from '@/art';
import { playSfx } from '@/audio/sound';
import { skinFor } from '@/campus/skins';
import { getCard, getLesson, getWorldOfLesson, nextWorldAfter, pathFor, trackFor } from '@/content';
import { allContentComplete, SEASON_1_FINALE, seasonComplete } from '@/engagement/plan';
import { displayStreak, shellRings, streakMultiplier } from '@/engagement/streak';
import { AssetCard } from '@/game/cards/AssetCard';
import { LessonPlayer } from '@/lessons/LessonPlayer';
import { Character } from '@/mascot/Character';
import { useGame, type Reward } from '@/state/game';
import { Backdrop } from '@/ui/Backdrop';
import { Button, Card, Coin, ComebackNote, RewardTile } from '@/ui/components';
import { colors, radius, space, type } from '@/ui/theme';

const STREAK_COPY: Record<Reward['streakEvent'], (n: number) => string> = {
  started: () => 'Day 1 of your Knowledge SIP! 🔥 Come back tomorrow to start compounding.',
  continued: (n) => `🔥 ${n}-day Knowledge SIP. Your XP boost compounds 1% a day.`,
  'same-day': () => "Today's Knowledge SIP deposit is already in ✅",
  protected: (n) => `🛡️ Your emergency fund covered a missed day. Streak saved at ${n}!`,
  reset: () => 'Your streak restarted, like a SIP after a withdrawal. Your knowledge stayed. Build it back!',
};

export default function LessonRoute() {
  const { id, step, preview } = useLocalSearchParams<{ id: string; step?: string; preview?: string }>();
  const lesson = getLesson(id);
  const completeLesson = useGame((s) => s.completeLesson);
  const multiplier = useGame((s) => streakMultiplier(Math.max(displayStreak(s.streak, s.today()), 1)));
  // Dev-only: ?preview=reward opens the reward screen with sample numbers (used by demo mode).
  const [reward, setReward] = useState<Reward | null>(() =>
    __DEV__ && preview === 'reward'
      ? { xp: 40, coins: 20, multiplier: 1.04, streakEvent: 'continued', streak: 8, finiqBefore: 333, finiqAfter: 341, newCards: ['savings'] }
      : null,
  );
  const insets = useSafeAreaInsets();
  const ageBand = useGame((s) => s.profile.ageBand);
  const completed = useGame((s) => s.lessons);
  const track = trackFor(ageBand);
  const skin = skinFor(track);
  const worldOfLesson = lesson ? getWorldOfLesson(lesson.id) : undefined;
  // Shown on the reward screen when this lesson was the last one left in its world.
  const worldJustDone = !!reward && !!worldOfLesson && worldOfLesson.lessons.every((l) => completed[l.id]);
  const nextWorld = worldOfLesson ? nextWorldAfter(worldOfLesson.id, track) : undefined;

  if (!lesson) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={type.body}>Lesson not found.</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (reward) {
    return (
      <Backdrop art="celebration" scrim="soft">
      <ScrollView contentContainerStyle={{ padding: space(2.5), paddingTop: insets.top + space(2), paddingBottom: insets.bottom + space(3), gap: space(2) }}>
        <View style={{ alignItems: 'center' }}>
          <Character name="kip" mood="cheer" size={150} rings={shellRings(reward.streak)} />
          <Text style={[type.hero, { textAlign: 'center' }]}>Lesson complete!</Text>
          <Text style={[type.small, { textAlign: 'center' }]}>{lesson.title}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: space(1), alignItems: 'stretch' }}>
          <RewardTile value={reward.xp} prefix="+" label="XP" note={`×${reward.multiplier.toFixed(2)} boost`} tint="#FFF6DD" border={colors.shell} color={colors.shellDark} />
          <RewardTile value={reward.coins} prefix="+" label="Coins" note={reward.coins ? 'to your wallet' : 'replay: no coins'} icon={<Coin size={24} />} />
          <RewardTile
            value={reward.finiqAfter}
            from={reward.finiqBefore}
            label="FinIQ"
            note={reward.finiqAfter > reward.finiqBefore ? `+${reward.finiqAfter - reward.finiqBefore} this lesson` : 'mastery kept'}
            tint={colors.kipLight}
            border={colors.kip}
            color={colors.kipDark}
          />
        </View>
        <Card>
          <Text style={type.bodyBold}>{STREAK_COPY[reward.streakEvent](reward.streak)}</Text>
        </Card>
        <ComebackNote coins={reward.comeback} />
        {lesson.id === SEASON_1_FINALE && seasonComplete(useGame.getState().lessons) ? (
          <View style={{ backgroundColor: colors.ink, borderRadius: radius.lg, padding: space(2), gap: 8 }}>
            <Text style={[type.tiny, { color: colors.coin }]}>🏆 SEASON 1 COMPLETE</Text>
            <Text style={[type.h2, { color: '#fff' }]}>You built your first money plan</Text>
            <Text style={[type.small, { color: '#DCE3EE' }]}>Your goal, its real price, the monthly amount and where to put it. Share it with a parent.</Text>
            <Button title="See my money plan" onPress={() => router.replace('/plan')} />
          </View>
        ) : null}
        {lesson.boss && allContentComplete(useGame.getState().lessons, trackFor(useGame.getState().profile.ageBand)) && lesson.id === pathFor(trackFor(useGame.getState().profile.ageBand)).at(-1)?.id ? (
          <View style={{ backgroundColor: colors.ink, borderRadius: radius.lg, padding: space(2), gap: 8 }}>
            <Text style={[type.tiny, { color: colors.coin }]}>🚀 EVERY WORLD COMPLETE</Text>
            <Text style={[type.h2, { color: '#fff' }]}>Launch Plan ready</Text>
            <Text style={[type.small, { color: '#DCE3EE' }]}>From barter in Money Town to your first paycheck: you can now plan, protect and grow money for real. Share your plan with a parent.</Text>
            <Button title="See my Launch Plan" onPress={() => router.replace('/plan')} />
          </View>
        ) : null}
        {worldJustDone && !reward.replay ? (
          // The lesson that finished a world: celebrate it and point to the next building on the map.
          <View style={{ backgroundColor: colors.kip, borderRadius: radius.lg, padding: space(2), gap: 8 }}>
            <Text style={[type.tiny, { color: '#fff', fontWeight: '900', letterSpacing: 1 }]}>🎉 WORLD {worldOfLesson!.index} COMPLETE</Text>
            <Text style={[type.h2, { color: '#fff' }]}>
              {skin.places[worldOfLesson!.id]?.name ?? worldOfLesson!.title} is done!
            </Text>
            {nextWorld ? (
              <>
                <Text style={[type.small, { color: '#F0FFF7' }]}>
                  Next stop: {skin.places[nextWorld.id]?.name ?? nextWorld.title} ({nextWorld.title}). Kip will walk you there.
                </Text>
                <Button testID="lesson-next-world" title={`Walk to ${skin.places[nextWorld.id]?.name ?? nextWorld.title} ›`} variant="secondary" onPress={() => router.dismissTo('/campus')} />
              </>
            ) : null}
          </View>
        ) : null}
        {reward.replay ? (
          <Card style={{ backgroundColor: colors.surface }}>
            <Text style={type.small}>
              Replays help it stick. They earn half XP (up to a daily limit) and no coins, so new lessons stay the best way to grow.
            </Text>
          </Card>
        ) : null}
        <Card style={{ borderColor: colors.kip }}>
          <Text style={[type.tiny, { color: colors.kipDark }]}>NEW SKILL UNLOCKED</Text>
          <Text style={[type.bodyBold, { marginTop: 4 }]}>✅ {lesson.capability}</Text>
        </Card>
        {reward.newCards.map((cid) => {
          const card = getCard(cid);
          return card ? <AssetCard key={cid} card={card} isNew /> : null;
        })}
        <Button
          testID="lesson-done"
          title="Continue"
          onPress={() => {
            // Primed (3 lessons + a run) and on a high: offer to save progress. Never blocks; backs off.
            const g = useGame.getState();
            const offer = shouldOfferSave({ offered: signInOffered, signedIn: !!g.account, lessonsDone: Object.keys(g.lessons).length, runs: g.runs.count, today: g.today(), prompt: g.savePrompt });
            if (offer && !preview) {
              g.noteSaveOffered();
              router.replace('/account');
            } else {
              router.back();
            }
          }}
        />
      </ScrollView>
      </Backdrop>
    );
  }

  const world = WORLD_BACKGROUND[getWorldOfLesson(lesson.id)?.id ?? 'w0'] ?? WORLD_BACKGROUND.w0;
  return (
    <Backdrop art={world.key} scrim="light">
    <LessonPlayer
      initialStep={__DEV__ && step ? Number(step) : 0}
      lesson={lesson}
      multiplier={multiplier}
      onExit={() =>
        Alert.alert('Leave this lesson?', "Your progress in this lesson won't be saved.", [
          { text: 'Keep learning', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.back() },
        ])
      }
      onComplete={(o) => {
        playSfx('celebrate');
        setReward(completeLesson(lesson.id, o));
      }}
    />
    </Backdrop>
  );
}
