/**
 * The Library hub and Quiz Battle. Reviews of finished lessons, plus a quick revision quiz: solo (beat
 * your best) or 1v1 on one phone (pass it to a friend; same questions, highest score wins).
 * Opens from the Library on the map, the League tab and Home nudges.
 */
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { playSfx } from '@/audio/sound';
import { WORLDS } from '@/content';
import { QUIZ_UNLOCK_TEXT, QUIZ_UNLOCK_WORLD, quizUnlocked } from '@/content/unlocks';
import { dueReviews } from '@/engagement/review';
import { Character } from '@/mascot/Character';
import { pickQuiz, pointsFor, quizPool, winnerOf, type PlayerResult, type QuizQuestion } from '@/quiz/quiz';
import { useGame, type Reward } from '@/state/game';
import { Backdrop } from '@/ui/Backdrop';
import { Button, Card, Coin, ProgressBar } from '@/ui/components';
import { colors, radius, space, type } from '@/ui/theme';

type Mode = 'solo' | 'duo';
type Phase = 'hub' | 'names' | 'play' | 'handoff' | 'results';

/** Wall-clock time, for answer timing and fresh quiz seeds (only ever called from event handlers). */
const clock = () => Date.now();

export default function QuizScreen() {
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const insets = useSafeAreaInsets();
  const lessons = useGame((s) => s.lessons);
  const today = useGame((s) => s.today());
  const myName = useGame((s) => s.profile.name) || 'You';
  const best = useGame((s) => s.quiz?.best ?? 0);
  const completeQuiz = useGame((s) => s.completeQuiz);
  const unlocked = quizUnlocked(lessons);
  const reviewsDue = dueReviews(lessons, today).length;

  const [mode, setMode] = useState<Mode>(params.mode === 'duo' ? 'duo' : 'solo');
  const [phase, setPhase] = useState<Phase>(params.mode && unlocked ? (params.mode === 'duo' ? 'names' : 'play') : 'hub');
  const [names, setNames] = useState<[string, string]>([myName, '']);
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => pickQuiz(quizPool(lessons), clock() % 1_000_000));
  const [player, setPlayer] = useState<0 | 1>(0);
  const [qi, setQi] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [live, setLive] = useState<PlayerResult>({ name: myName, points: 0, correct: 0, missed: [] });
  const [reward, setReward] = useState<Reward | null>(null);
  const [prevBest, setPrevBest] = useState(best);
  const askedAt = useRef(0);
  // Opening straight into a quiz (from a nudge): start the first question's clock on load.
  useEffect(() => {
    if (!askedAt.current) askedAt.current = clock();
  }, []);

  const begin = (m: Mode, n: [string, string] = names) => {
    setMode(m);
    setQuestions(pickQuiz(quizPool(lessons), clock() % 1_000_000));
    setPlayer(0);
    setQi(0);
    setChosen(null);
    setResults([]);
    setReward(null);
    setPrevBest(best);
    setLive({ name: m === 'duo' ? n[0].trim() || 'Player 1' : myName, points: 0, correct: 0, missed: [] });
    askedAt.current = clock();
    setPhase('play');
  };

  const answer = (i: number) => {
    if (chosen !== null) return;
    const q = questions[qi];
    const right = q.options[i].correct;
    const secs = (clock() - askedAt.current) / 1000;
    setChosen(i);
    setLive((r) => ({ ...r, points: r.points + pointsFor(right, secs), correct: r.correct + (right ? 1 : 0), missed: right ? r.missed : [...r.missed, q.id] }));
    playSfx(right ? 'correct' : 'wrong');
    Haptics.notificationAsync(right ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
  };

  const next = () => {
    if (qi + 1 < questions.length) {
      setQi(qi + 1);
      setChosen(null);
      askedAt.current = clock();
      return;
    }
    // This player is done.
    const done = [...results, live];
    setResults(done);
    if (mode === 'duo' && player === 0) {
      setPhase('handoff');
      return;
    }
    // Reward the phone's owner (player 1 in a 1v1) once, at the end.
    const mine = done[0];
    setReward(completeQuiz(mine.correct, questions.length, mine.points));
    playSfx('celebrate');
    setPhase('results');
  };

  const startPlayer2 = () => {
    setPlayer(1);
    setQi(0);
    setChosen(null);
    setLive({ name: names[1].trim() || 'Player 2', points: 0, correct: 0, missed: [] });
    askedAt.current = clock();
    setPhase('play');
  };

  const close = (
    <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 16, fontWeight: '900', color: colors.ink }}>✕</Text>
    </Pressable>
  );
  const wrap = (children: React.ReactNode) => (
    <Backdrop art="celebration" scrim="light">
      <ScrollView contentContainerStyle={{ padding: space(2.5), paddingTop: insets.top + space(1.5), paddingBottom: insets.bottom + space(4), gap: space(2) }}>{children}</ScrollView>
    </Backdrop>
  );

  // ---- Hub: reviews + quiz choices ----
  if (phase === 'hub') {
    const w1 = WORLDS.find((w) => w.id === QUIZ_UNLOCK_WORLD)!;
    const w1Done = w1.lessons.filter((l) => lessons[l.id]).length;
    return wrap(
      <>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={type.title}>📚 Library</Text>
          {close}
        </View>
        <Text style={type.body}>Keep what you’ve learned sharp: reviews, and quick quizzes on your lessons.</Text>

        <Card style={{ gap: space(1) }}>
          <Text style={type.h2}>Reviews</Text>
          {reviewsDue > 0 ? (
            <>
              <Text style={type.small}>
                {reviewsDue} {reviewsDue === 1 ? 'lesson is' : 'lessons are'} due for a quick review, so the ideas stick for good.
              </Text>
              <Button testID="library-reviews" title={`Start ${reviewsDue} ${reviewsDue === 1 ? 'review' : 'reviews'}`} onPress={() => router.replace('/review')} />
            </>
          ) : (
            <Text style={type.small}>All caught up! Lessons come back here 1, 3, 7 and 21 days after you finish them.</Text>
          )}
        </Card>

        <View style={{ gap: space(1.25) }}>
          <Text style={type.h2}>🧠 Quiz Battle</Text>
          {unlocked ? (
            <>
              <Pressable testID="quiz-solo" onPress={() => begin('solo')} accessibilityRole="button" accessibilityLabel="Quiz just me">
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5), borderColor: colors.kip, borderWidth: 2 }}>
                  <Character name="kip" mood="think" size={64} animate={false} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={type.bodyBold}>Just me</Text>
                    <Text style={type.small}>8 questions from your lessons. Right answers score; quick ones score more.{best ? ` Your best: ${best}.` : ''}</Text>
                  </View>
                  <Text style={[type.h2, { color: colors.kipDark }]}>▶</Text>
                </Card>
              </Pressable>
              <Pressable testID="quiz-duo" onPress={() => setPhase('names')} accessibilityRole="button" accessibilityLabel="Quiz 1v1 with a friend on this phone">
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5), borderColor: colors.dash, borderWidth: 2 }}>
                  <Character name="dash" mood="cheer" size={64} animate={false} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={type.bodyBold}>1v1 on one phone</Text>
                    <Text style={type.small}>Play, then pass the phone to a friend or sibling. Same questions; highest score wins.</Text>
                  </View>
                  <Text style={[type.h2, { color: colors.dashDark }]}>▶</Text>
                </Card>
              </Pressable>
            </>
          ) : (
            <Card style={{ gap: space(1) }}>
              <Text style={type.bodyBold}>🔒 {QUIZ_UNLOCK_TEXT}</Text>
              <Text style={type.small}>Solo quizzes and 1v1 battles with a friend, on everything you’ve learned.</Text>
              <ProgressBar value={w1Done / w1.lessons.length} />
              <Text style={type.tiny}>
                The Melt: {w1Done} of {w1.lessons.length} lessons
              </Text>
            </Card>
          )}
        </View>
      </>,
    );
  }

  // ---- 1v1: names ----
  if (phase === 'names') {
    return wrap(
      <>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={type.title}>👥 1v1 Quiz</Text>
          {close}
        </View>
        <Text style={type.body}>Two players, one phone. Player 1 answers all 8, then passes the phone. Same questions for both.</Text>
        {(['Player 1', 'Player 2'] as const).map((label, i) => (
          <View key={label} style={{ gap: 6 }}>
            <Text style={type.bodyBold}>{label}</Text>
            <TextInput
              testID={`quiz-name-${i + 1}`}
              value={names[i]}
              onChangeText={(t) => setNames((n) => (i === 0 ? [t, n[1]] : [n[0], t]))}
              placeholder={i === 0 ? 'Your name' : 'Friend’s name'}
              placeholderTextColor={colors.inkMuted}
              maxLength={16}
              autoCapitalize="words"
              style={[type.bodyBold, { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, padding: space(1.75), fontSize: 18 }]}
            />
          </View>
        ))}
        <Button testID="quiz-duo-start" title="Start the battle ▶" onPress={() => begin('duo')} />
        <Text style={[type.tiny, { textAlign: 'center' }]}>Names stay on this phone. Only your own result counts toward your streak.</Text>
      </>,
    );
  }

  // ---- 1v1: pass the phone ----
  if (phase === 'handoff') {
    const p1 = results[0];
    const p2 = names[1].trim() || 'Player 2';
    return wrap(
      <View style={{ alignItems: 'center', gap: space(2), marginTop: space(4) }}>
        <Character name="dash" mood="cheer" size={140} />
        <Text style={[type.title, { textAlign: 'center' }]}>Pass the phone to {p2}!</Text>
        <Text style={[type.body, { textAlign: 'center' }]}>
          {p1.name} is done. No peeking at the answers, {p1.name} 🙈
        </Text>
        <Button testID="quiz-handoff" title={`I’m ${p2}. Let’s go!`} onPress={startPlayer2} style={{ alignSelf: 'stretch' }} />
      </View>,
    );
  }

  // ---- Results ----
  if (phase === 'results') {
    const missedIds = new Set(results.flatMap((r) => r.missed));
    const review = questions.filter((q) => missedIds.has(q.id));
    const solo = mode === 'solo';
    const me = results[0];
    const w = solo ? null : winnerOf(results[0], results[1]);
    return wrap(
      <>
        <View style={{ alignItems: 'center', gap: space(1) }}>
          <Character name={solo || w !== 'b' ? 'kip' : 'dash'} mood="cheer" size={120} />
          {solo ? (
            <>
              <Text style={type.hero}>{me.points} points</Text>
              <Text style={type.body}>
                {me.correct} of {questions.length} right{me.points > prevBest && prevBest > 0 ? ' · New best! 🎉' : ''}
              </Text>
            </>
          ) : (
            <Text style={[type.title, { textAlign: 'center' }]}>{w === 'draw' ? 'It’s a draw!' : `${results[w === 'a' ? 0 : 1].name} wins! 🏆`}</Text>
          )}
        </View>
        {!solo ? (
          <View style={{ flexDirection: 'row', gap: space(1.5) }}>
            {results.map((r, i) => {
              const won = (w === 'a' && i === 0) || (w === 'b' && i === 1);
              return (
                <Card key={i} style={{ flex: 1, alignItems: 'center', gap: 2, borderColor: won ? colors.coin : colors.line, borderWidth: won ? 3 : 1.5 }}>
                  <Text style={type.bodyBold} numberOfLines={1}>
                    {won ? '👑 ' : ''}
                    {r.name}
                  </Text>
                  <Text style={type.title}>{r.points}</Text>
                  <Text style={type.tiny}>
                    {r.correct}/{questions.length} right
                  </Text>
                </Card>
              );
            })}
          </View>
        ) : null}
        {reward ? (
          <Card style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <Text style={type.bodyBold}>+{reward.xp} XP</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Coin size={18} />
              <Text style={type.bodyBold}>{reward.coins ? `+${reward.coins}` : 'first quiz each day earns coins'}</Text>
            </View>
          </Card>
        ) : null}
        {review.length ? (
          <View style={{ gap: space(1) }}>
            <Text style={type.h2}>Let’s revisit</Text>
            {review.map((q) => {
              const right = q.options.find((o) => o.correct)!;
              return (
                <Card key={q.id} style={{ gap: 4 }}>
                  <Text style={type.bodyBold}>{q.question}</Text>
                  <Text style={[type.small, { color: colors.kipDark, fontWeight: '800' }]}>✅ {right.text}</Text>
                  <Text style={type.small}>{right.why}</Text>
                </Card>
              );
            })}
          </View>
        ) : (
          <Card>
            <Text style={type.bodyBold}>Perfect round! Every question right. 🌟</Text>
          </Card>
        )}
        <Button testID="quiz-again" title={solo ? 'Play again' : 'Rematch'} onPress={() => begin(mode)} />
        <Button title="Done" variant="secondary" onPress={() => router.back()} />
      </>,
    );
  }

  // ---- Play ----
  const q = questions[qi];
  if (!q) {
    return wrap(
      <>
        <Text style={type.title}>No questions yet</Text>
        <Text style={type.body}>Finish a few lessons and come back.</Text>
        <Button title="Back" onPress={() => router.back()} />
      </>,
    );
  }
  const picked = chosen !== null ? q.options[chosen] : null;
  return wrap(
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[type.tiny, { fontWeight: '900', color: mode === 'duo' && player === 1 ? colors.dashDark : colors.kipDark, letterSpacing: 1 }]}>
          {mode === 'duo' ? `${live.name.toUpperCase()} · ` : ''}QUESTION {qi + 1}/{questions.length}
        </Text>
        <Text style={[type.bodyBold, { color: colors.ink }]}>{live.points} pts</Text>
      </View>
      <ProgressBar value={(qi + (chosen !== null ? 1 : 0)) / questions.length} color={mode === 'duo' && player === 1 ? colors.dash : colors.kip} />
      <Text style={type.title}>{q.question}</Text>
      <View style={{ gap: space(1) }}>
        {q.options.map((o, i) => {
          const isPicked = chosen === i;
          const showRight = chosen !== null && o.correct;
          const bg = showRight ? colors.kipLight : isPicked ? colors.dashLight : colors.surface;
          const border = showRight ? colors.kip : isPicked ? colors.dash : colors.line;
          return (
            <Pressable key={i} testID={`quiz-option-${i}`} onPress={() => answer(i)} disabled={chosen !== null} accessibilityRole="button" accessibilityState={{ selected: isPicked }}>
              <View style={{ padding: space(1.75), borderRadius: radius.md, borderWidth: 2.5, borderBottomWidth: 5, borderColor: border, backgroundColor: bg }}>
                <Text style={type.bodyBold}>
                  {showRight ? '✅ ' : isPicked ? '❌ ' : ''}
                  {o.text}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {picked ? (
        <Card style={{ gap: 4, borderColor: picked.correct ? colors.kip : colors.dash }}>
          <Text style={[type.bodyBold, { color: picked.correct ? colors.kipDark : colors.dashDark }]}>{picked.correct ? 'Right!' : 'Not quite.'}</Text>
          <Text style={type.small}>{picked.correct ? picked.why : q.options.find((x) => x.correct)!.why}</Text>
        </Card>
      ) : null}
      {chosen !== null ? <Button testID="quiz-next" title={qi + 1 < questions.length ? 'Next' : mode === 'duo' && player === 0 ? 'Done: pass the phone' : 'See results'} onPress={next} /> : null}
    </>,
  );
}
