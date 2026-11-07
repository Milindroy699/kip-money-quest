/** Plays one lesson: Hook → Concept → Play → Check → Connect, then reports the outcome. */
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Image } from 'expo-image';

import { PROPS } from '../art';
import { playSfx } from '../audio/sound';
import { getCard, questionsForRun } from '../content';
import { LoadoutPicker } from '../game/runner/LoadoutPicker';
import { CARD_LOADOUTS } from '../game/runner/loadouts';
import type { LessonT, RunModeT, StepT } from '../content/schema';
import { AssetCard } from '../game/cards/AssetCard';
import { dashTierFor, type RunMode, type RunResult } from '../game/runner/engine';
import { RunnerScene } from '../game/runner/RunnerScene';
import { RunResults } from '../game/runner/RunResults';
import { ChartResults } from '../game/surfer/ChartResults';
import { ChartSurferScene } from '../game/surfer/ChartSurferScene';
import type { SurfResult } from '../games/chartSurfer';
import { Character } from '../mascot/Character';
import { SpeechBubble } from '../mascot/SpeechBubble';
import { hashSeed } from '../sim/rng';
import { useGame, type Reward } from '../state/game';
import { Button, Card, Chip, ProgressBar } from '../ui/components';
import { colors, radius, space, type } from '../ui/theme';
import { ConceptWidget } from './widgets';

const SPEAKER_NAMES = { kip: 'Kip', dash: 'Dash', melt: 'The Melt' } as const;

export interface LessonOutcomeT {
  correct: number;
  total: number;
  boss?: boolean;
}

export function LessonPlayer({
  lesson,
  multiplier,
  onExit,
  onComplete,
  initialStep = 0,
}: {
  lesson: LessonT;
  multiplier: number;
  onExit: () => void;
  onComplete: (o: LessonOutcomeT) => void;
  initialStep?: number;
}) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(Math.min(Math.max(initialStep, 0), lesson.steps.length - 1));
  const score = useRef({ correct: 0, total: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const step = lesson.steps[index];

  const next = useCallback(() => {
    if (index + 1 >= lesson.steps.length) onComplete({ ...score.current, boss: lesson.boss });
    else setIndex((i) => i + 1);
  }, [index, lesson, onComplete]);
  const onAnswer = useCallback((correct: boolean) => {
    score.current.total += 1;
    if (correct) score.current.correct += 1;
  }, []);

  return (
    <View style={{ flex: 1, paddingTop: fullscreen ? 0 : insets.top }}>
      {!fullscreen ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space(2), paddingVertical: space(1) }}>
          <Pressable onPress={onExit} accessibilityRole="button" accessibilityLabel="Close lesson" hitSlop={12}>
            <Text style={{ fontSize: 26, color: colors.inkMuted }}>✕</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <ProgressBar value={index / lesson.steps.length} />
          </View>
          <Chip label={`×${multiplier.toFixed(2)}`} color={colors.shellDark} />
        </View>
      ) : null}
      <StepView key={index} step={step} lesson={lesson} onNext={next} onAnswer={onAnswer} setFullscreen={setFullscreen} bottomInset={insets.bottom} />
    </View>
  );
}

function StepView({
  step,
  lesson,
  onNext,
  onAnswer,
  setFullscreen,
  bottomInset,
}: {
  step: StepT;
  lesson: LessonT;
  onNext: () => void;
  onAnswer: (correct: boolean) => void;
  setFullscreen: (v: boolean) => void;
  bottomInset: number;
}) {
  switch (step.type) {
    case 'story':
      return <StoryStep step={step} onNext={onNext} bottomInset={bottomInset} />;
    case 'concept':
      return <ConceptStep step={step} onNext={onNext} bottomInset={bottomInset} />;
    case 'play':
      return <PlayStep step={step} lessonId={lesson.id} onNext={onNext} setFullscreen={setFullscreen} />;
    case 'quiz':
      return <QuizStep step={step} onNext={onNext} onAnswer={onAnswer} bottomInset={bottomInset} />;
    case 'connect':
      return <ConnectStep step={step} lesson={lesson} onNext={onNext} bottomInset={bottomInset} />;
  }
}

function Footer({ children, bottomInset }: { children: React.ReactNode; bottomInset: number }) {
  return <View style={{ padding: space(2.5), paddingBottom: Math.max(bottomInset, space(2.5)), gap: space(1.5) }}>{children}</View>;
}

// ---- Story ---------------------------------------------------------------------------

function StoryStep({ step, onNext, bottomInset }: { step: Extract<StepT, { type: 'story' }>; onNext: () => void; bottomInset: number }) {
  const [line, setLine] = useState(0);
  const last = line >= step.lines.length - 1;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: space(2.5), gap: space(3) }}>
        <SpeechBubble text={step.lines[line]} speaker={SPEAKER_NAMES[step.speaker]} />
        <View style={{ alignItems: 'flex-start', paddingLeft: space(1) }}>
          <Character name={step.speaker} mood={step.mood ?? 'talk'} size={170} />
        </View>
      </View>
      <Footer bottomInset={bottomInset}>
        <Button testID="story-next" title={last ? 'Continue' : 'Next'} onPress={() => (last ? onNext() : setLine((l) => l + 1))} />
      </Footer>
    </View>
  );
}

// ---- Concept (predict → explore → reveal) ------------------------------------------------

function ConceptStep({ step, onNext, bottomInset }: { step: Extract<StepT, { type: 'concept' }>; onNext: () => void; bottomInset: number }) {
  const [guess, setGuess] = useState<number | null>(step.predict ? null : -1);
  const [done, setDone] = useState(false);
  const onDone = useCallback(() => setDone(true), []);
  const predict = step.predict;

  if (predict && guess === null) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: space(2.5), gap: space(2) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Character name="kip" mood="think" size={64} animate={false} />
            <Text style={[type.small, { color: colors.kipDark, fontWeight: '800' }]}>PREDICT FIRST</Text>
          </View>
          <Text style={type.title}>{predict.question}</Text>
          {predict.options.map((o, i) => (
            <Button key={o} title={o} variant="secondary" onPress={() => setGuess(i)} />
          ))}
        </ScrollView>
      </View>
    );
  }

  const right = predict && guess === predict.correct;
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: space(2.5), gap: space(2) }}>
        <Text style={type.title}>{step.title}</Text>
        {step.caption ? <Text style={type.body}>{step.caption}</Text> : null}
        {predict && guess !== null && guess >= 0 ? <Chip label={`You guessed: ${predict.options[guess]}`} /> : null}
        <ConceptWidget step={step} onDone={onDone} />
        {done && predict ? (
          <Card style={{ backgroundColor: right ? colors.kipLight : colors.dashLight, borderColor: right ? colors.kip : colors.dash }}>
            <Text style={type.bodyBold}>{right ? 'Nailed it! 🎯' : 'Surprised? Most people are.'}</Text>
            <Text style={[type.body, { marginTop: 4 }]}>{predict.reveal}</Text>
          </Card>
        ) : null}
      </ScrollView>
      <Footer bottomInset={bottomInset}>
        <Button testID="concept-next" title={done ? 'Got it' : 'Explore to continue'} disabled={!done} onPress={onNext} />
      </Footer>
    </View>
  );
}

// ---- Play ---------------------------------------------------------------------------------

const MODE_LABEL: Record<RunModeT, string> = {
  inflation: 'KIP RUN · INFLATION CHASE',
  snowball: 'KIP RUN · SNOWBALL',
  risk: 'KIP RUN · RISK LANES',
  timeframe: 'KIP RUN · TIME TRACKS',
  chart: 'CHART SURFER',
};

function PlayStep({ step, lessonId, onNext, setFullscreen }: { step: Extract<StepT, { type: 'play' }>; lessonId: string; onNext: () => void; setFullscreen: (v: boolean) => void }) {
  const [phase, setPhase] = useState<'brief' | 'run' | 'done'>('brief');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const [surf, setSurf] = useState<SurfResult | null>(null);
  const [reward, setReward] = useState<Reward | null>(null);
  const chart = step.mode === 'chart';
  const [auto, setAuto] = useState(false);
  const completeRun = useGame((s) => s.completeRun);
  const runnerButtons = useGame((s) => s.profile.runnerButtons);
  const dashDodged = useGame((s) => s.runs.dashDodged);
  const ownedCards = useGame((s) => s.cards);
  const loadoutId = useGame((s) => s.profile.loadout);
  const lessons = useGame((s) => s.lessons);
  const setProfile = useGame((s) => s.setProfile);
  const loadout = CARD_LOADOUTS[ownedCards.includes(loadoutId) ? loadoutId : 'cash'];
  const [questions] = useState(() => questionsForRun(lessonId, lessons));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setFullscreen(phase === 'run');
    return () => setFullscreen(false);
  }, [phase, setFullscreen]);

  if (phase === 'brief') {
    return (
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <ScrollView contentContainerStyle={{ padding: space(2.5), gap: space(2) }}>
          <Text style={[type.small, { color: colors.kipDark, fontWeight: '800' }]}>{MODE_LABEL[step.mode]}</Text>
          <SpeechBubble text={step.brief} speaker="Kip" />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <Character name="kip" pose="full" size={150} />
            {chart ? <Character name="dash" mood="cheer" size={110} /> : <Character name="melt" mood="worry" size={110} />}
          </View>
          {chart ? (
            <Card style={{ gap: 10 }}>
              {[
                ['🏄', 'Kip surfs the newest edge of the chart. The past is behind him; the future is fog.'],
                ['👆', 'Tap to jump: grab high coins, and clear hot tips and overnight NEWS GAPS.'],
                ['📈', 'At support, resistance and other patterns the chart pauses: swipe ↑ or ↓ to make your read.'],
                ['🟣', 'The purple rail is the moving average; dashed lines are support, resistance and necklines.'],
              ].map(([emoji, line]) => (
                <View key={line} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ width: 44, fontSize: 26, textAlign: 'center' }} importantForAccessibility="no">
                    {emoji}
                  </Text>
                  <Text style={[type.small, { color: colors.ink, flex: 1 }]}>{line}</Text>
                </View>
              ))}
            </Card>
          ) : (
          <Card style={{ gap: 10 }}>
            {(
              (step.mode === 'timeframe'
                ? [
                    { emoji: '⚡', text: 'SCALPING: tiny coins, a FEE arch on every trade' },
                    { emoji: '☀️', text: 'INTRADAY: the 3:30 BELL squares off your coins, minus a fee' },
                    { emoji: '🌙', text: 'SWING: jump ↑ the overnight NEWS GAPS' },
                    { emoji: '🐢', text: 'LONG TERM: no fees, dividends, and banked coins compound' },
                  ]
                : step.mode === 'snowball'
                ? [
                    { img: PROPS.sipGate, text: 'SIP gate: banks your coins +10%' },
                    { img: PROPS.cashOut, text: 'CASH OUT +15: resets your snowball' },
                  ]
                : step.mode === 'risk'
                  ? [
                      { emoji: '🛡️', text: 'SAFE gate (left): small, steady growth' },
                      { emoji: '⚖️', text: 'BALANCED gate (middle): grows more, wobbles' },
                      { emoji: '🔥', text: 'WILD gate (right): biggest growth, biggest swings' },
                      { emoji: '📱', text: 'Surprise expenses: paid from idle coins, or you sell in a hurry' },
                    ]
                  : [{ img: PROPS.investGate, text: 'INVEST gate: banks your idle coins' }]) as { img?: number; emoji?: string; text: string }[]
            )
              .concat([
                { img: PROPS.feeToll, text: 'FEE booth: swipe ↑ to jump' },
                { img: PROPS.billboard, text: 'SALE sign: swipe ↓ to slide under' },
                { img: PROPS.hotTip, text: "Dash's HOT TIP: swipe ← → to dodge" },
              ])
              .concat(questions.length ? [{ img: PROPS.investGate, text: 'ANSWER GATES: run through the right answer to bank a bonus' }] : [])
              .map((row) => (
                <View key={row.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {row.img ? (
                    <Image source={row.img} style={{ width: 44, height: 44 }} contentFit="contain" accessible={false} />
                  ) : (
                    <Text style={{ width: 44, fontSize: 26, textAlign: 'center' }} importantForAccessibility="no">
                      {row.emoji}
                    </Text>
                  )}
                  <Text style={[type.small, { color: colors.ink, flex: 1 }]}>{row.text}</Text>
                </View>
              ))}
          </Card>
          )}
          {chart ? null : <LoadoutPicker owned={ownedCards} selected={loadout.id} onSelect={(id) => setProfile({ loadout: id })} />}
        </ScrollView>
        <View style={{ padding: space(2.5), paddingBottom: Math.max(insets.bottom, space(2.5)) }}>
          <Button
            title="Start run ▶"
            onPress={() => {
              setAuto(false);
              setPhase('run');
            }}
          />
          <Button
            testID="watch-kip"
            title="Watch Kip play instead (no coins)"
            variant="ghost"
            onPress={() => {
              setAuto(true);
              setPhase('run');
            }}
          />
        </View>
      </View>
    );
  }
  if (phase === 'run' && chart) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#141B33' }}>
        <ChartSurferScene
          key={attempt}
          seed={hashSeed(`${lessonId}:surf:${attempt}`)}
          autopilot={auto}
          showButtons={runnerButtons}
          onFinish={(r) => {
            setReward(completeRun({ mode: 'chart', coinsAwarded: r.score, dashDodged: 0 }, { autopilot: auto }));
            setSurf(r);
            setPhase('done');
          }}
        />
      </View>
    );
  }
  if (phase === 'run') {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <RunnerScene
          key={attempt}
          mode={step.mode as RunMode}
          durationSec={step.durationSec}
          seed={hashSeed(`${lessonId}:${attempt}`)}
          autopilot={auto}
          showButtons={runnerButtons}
          questions={questions}
          loadout={loadout}
          dashTier={dashTierFor(dashDodged)}
          onFinish={(r) => {
            setReward(completeRun(r, { autopilot: auto }));
            setResult(r);
            setPhase('done');
          }}
        />
      </View>
    );
  }
  if (chart) {
    return surf ? (
      <ChartResults
        result={surf}
        reward={reward ?? undefined}
        autopilot={auto}
        onContinue={onNext}
        onReplay={() => {
          setAuto(false);
          setAttempt((a) => a + 1);
          setPhase('run');
        }}
      />
    ) : null;
  }
  return result ? (
    <RunResults
      result={result}
      reward={reward ?? undefined}
      autopilot={auto}
      onContinue={onNext}
      onReplay={() => {
        setAuto(false);
        setAttempt((a) => a + 1);
        setPhase('run');
      }}
    />
  ) : null;
}

// ---- Quiz -----------------------------------------------------------------------------------

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function QuizStep({ step, onNext, onAnswer, bottomInset }: { step: Extract<StepT, { type: 'quiz' }>; onNext: () => void; onAnswer: (correct: boolean) => void; bottomInset: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  // Shuffled once per question, so the right answer isn't always in the same place.
  const [order] = useState(() => shuffled(step.options.map((_, i) => i)));
  const correctIndex = step.options.findIndex((o) => o.correct);
  const isRight = selected === correctIndex;

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    onAnswer(isRight);
    playSfx(isRight ? 'correct' : 'wrong');
    if (isRight) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: space(2.5), gap: space(1.5) }}>
        <Text style={[type.small, { color: colors.kipDark, fontWeight: '800' }]}>CHECK</Text>
        <Text style={[type.title, { marginBottom: space(1) }]}>{step.question}</Text>
        {order.map((i) => {
          const o = step.options[i];
          const state = !checked ? (selected === i ? 'selected' : 'idle') : i === correctIndex ? 'correct' : selected === i ? 'wrong' : 'idle';
          const border = { idle: colors.line, selected: colors.ink, correct: colors.kip, wrong: colors.error }[state];
          const bg = { idle: colors.surface, selected: '#F3F4F6', correct: colors.kipLight, wrong: colors.errorLight }[state];
          return (
            <Pressable
              key={o.text}
              disabled={checked}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSelected(i);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === i, disabled: checked }}>
              <View style={{ borderWidth: 2.5, borderColor: border, backgroundColor: bg, borderRadius: radius.md, padding: space(2), borderBottomWidth: 5, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Text style={[type.bodyBold, { flex: 1 }]}>{o.text}</Text>
                {state === 'correct' ? <Text style={{ fontSize: 20 }}>✅</Text> : state === 'wrong' ? <Text style={{ fontSize: 20 }}>❌</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      {checked && selected !== null ? (
        <View style={{ backgroundColor: isRight ? colors.kipLight : colors.errorLight, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space(2.5), paddingBottom: Math.max(bottomInset, space(2.5)), gap: space(1.5) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Character name="kip" mood={isRight ? 'cheer' : 'think'} size={56} animate={false} />
            <Text style={[type.h2, { color: isRight ? colors.kipDark : colors.error }]}>{isRight ? 'Correct!' : 'Not quite!'}</Text>
          </View>
          <Text style={type.body}>{step.options[selected].why}</Text>
          {!isRight ? <Text style={[type.small, { color: colors.ink }]}>Answer: {step.options[correctIndex].text}</Text> : null}
          <Button testID="quiz-continue" title="Continue" variant={isRight ? 'primary' : 'danger'} onPress={onNext} />
        </View>
      ) : (
        <Footer bottomInset={bottomInset}>
          <Button testID="quiz-check" title="Check" disabled={selected === null} onPress={check} />
        </Footer>
      )}
    </View>
  );
}

// ---- Connect --------------------------------------------------------------------------------

function ConnectStep({ step, lesson, onNext, bottomInset }: { step: Extract<StepT, { type: 'connect' }>; lesson: LessonT; onNext: () => void; bottomInset: number }) {
  const card = step.cardId ? getCard(step.cardId) : undefined;
  const owned = useGame((s) => (step.cardId ? s.cards.includes(step.cardId) : false));
  const builder = useGame((s) => s.profile.ageBand === '16-19');
  const isNew = !!card && !owned && (lesson.unlockCards ?? []).includes(card.id);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: space(2.5), gap: space(2) }}>
        <Text style={[type.small, { color: colors.kipDark, fontWeight: '800' }]}>IN REAL LIFE</Text>
        <Text style={type.title}>{step.title}</Text>
        {card ? <AssetCard card={card} isNew={isNew} /> : null}
        <Card>
          <Text style={type.body}>{step.realLife}</Text>
        </Card>
        {builder && step.deeper ? (
          <Card style={{ borderColor: colors.melt, backgroundColor: colors.meltLight }}>
            <Text style={[type.small, { color: colors.meltDark, fontWeight: '800' }]}>🔍 BUILDER DEEP-DIVE</Text>
            <Text style={[type.body, { marginTop: 4 }]}>{step.deeper}</Text>
          </Card>
        ) : null}
        {step.mission ? (
          <Card style={{ backgroundColor: colors.dashLight, borderColor: colors.dash }}>
            <Text style={[type.small, { color: colors.dashDark, fontWeight: '800' }]}>🎯 REAL-WORLD MISSION</Text>
            <Text style={[type.bodyBold, { marginTop: 4 }]}>{step.mission}</Text>
          </Card>
        ) : null}
      </ScrollView>
      <Footer bottomInset={bottomInset}>
        <Button testID="connect-next" title={isNew ? 'Add to my deck' : 'Continue'} onPress={onNext} />
      </Footer>
    </View>
  );
}
