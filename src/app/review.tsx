/** Spaced review: one question from each lesson that is due today. Counts toward the streak. */
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { playSfx } from '@/audio/sound';
import { getLesson } from '@/content';
import type { StepT } from '@/content/schema';
import { dueReviews } from '@/engagement/review';
import { QuizStep } from '@/lessons/LessonPlayer';
import { Character } from '@/mascot/Character';
import { useGame, type Reward } from '@/state/game';
import { Backdrop } from '@/ui/Backdrop';
import { Button, Card, ComebackNote, ProgressBar } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

type Quiz = Extract<StepT, { type: 'quiz' }>;

export default function Review() {
  const insets = useSafeAreaInsets();
  const completeReview = useGame((s) => s.completeReview);
  const items = useMemo(() => {
    const s = useGame.getState();
    return dueReviews(s.lessons, s.today()).flatMap((id) => {
      const lesson = getLesson(id);
      const quizzes = (lesson?.steps.filter((st) => st.type === 'quiz') ?? []) as Quiz[];
      if (!quizzes.length) return [];
      return [{ id, quiz: quizzes[s.lessons[id].reviewsDone % quizzes.length], title: lesson!.title }];
    });
  }, []);
  const [i, setI] = useState(0);
  const score = useRef({ correct: 0, total: 0 });
  const [reward, setReward] = useState<Reward | null>(null);
  const [final, setFinal] = useState({ correct: 0, total: 0 });

  if (!items.length || reward) {
    return (
      <Backdrop art="celebration" scrim="soft">
      <View style={{ flex: 1, padding: space(2.5), paddingTop: insets.top + space(4), gap: space(2), alignItems: 'center' }}>
        <Character name="kip" mood="cheer" size={150} />
        <Text style={type.title}>{reward ? 'Review complete!' : 'Nothing due right now'}</Text>
        {reward ? (
          <Card style={{ alignSelf: 'stretch' }}>
            <Text style={type.bodyBold}>
              {final.correct}/{final.total} correct · +{reward.xp} XP · +{reward.coins} coins
            </Text>
            <Text style={[type.small, { marginTop: 4 }]}>Remembering is compounding for your brain. These come back again later so they stick.</Text>
          </Card>
        ) : null}
        {reward ? <View style={{ alignSelf: 'stretch' }}><ComebackNote coins={reward.comeback} /></View> : null}
        <View style={{ flex: 1 }} />
        <Button title="Done" style={{ alignSelf: 'stretch' }} onPress={() => router.back()} />
      </View>
      </Backdrop>
    );
  }

  const item = items[i];
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space(2), paddingVertical: space(1) }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close review" hitSlop={12}>
          <Text style={{ fontSize: 26, color: colors.inkMuted }}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={i / items.length} color={colors.shell} />
        </View>
      </View>
      <Text style={[type.tiny, { paddingHorizontal: space(2.5) }]}>REVIEW · {item.title}</Text>
      <QuizStep
        key={item.id}
        step={item.quiz}
        onAnswer={(correct) => {
          score.current.total += 1;
          if (correct) score.current.correct += 1;
        }}
        bottomInset={insets.bottom}
        onNext={() => {
          if (i + 1 < items.length) setI(i + 1);
          else {
            setFinal({ ...score.current });
            playSfx('celebrate');
            setReward(completeReview(items.map((x) => x.id), score.current.correct));
          }
        }}
      />
    </View>
  );
}
