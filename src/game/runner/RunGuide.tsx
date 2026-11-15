/**
 * "How Kip Run works": a short, step-by-step look at everything on the road before the first run.
 * One card per object, each with what to do and what it does to your money, and a goal meter that
 * moves closer to (or further from) the player's own dream goal. Progressive: one idea at a time.
 */
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PROPS } from '../../art';
import { Character } from '../../mascot/Character';
import { useGame } from '../../state/game';
import { Button, Card, ProgressBar } from '../../ui/components';
import { goalOf, goalShort } from '../../ui/FutureYou';
import { colors, radius, space, type } from '../../ui/theme';

type Effect = 'good' | 'bad' | 'neutral';

interface Step {
  key: string;
  art: { prop: keyof typeof PROPS } | { character: 'melt' | 'dash' };
  name: string;
  action: string;
  effect: Effect;
  /** What hitting it does to your money. `{goal}` becomes the player's goal. */
  text: string;
  /** The goal meter after this card (0–1), so good things push it up and slips pull it down. */
  meter: number;
  delta?: string;
}

export const RUN_GUIDE_STEPS: Step[] = [
  { key: 'coin', art: { prop: 'coin' }, name: 'Coins', action: 'Swipe ← → to grab them', effect: 'neutral', text: 'Coins are your money. But coins in your pocket are idle money, and idle money shrinks.', meter: 0.45 },
  { key: 'invest', art: { prop: 'investGate' }, name: 'INVEST gate', action: 'Steer into it', effect: 'good', text: 'Banks your coins: safe from The Melt, and they compound (grow on their own). This is how you reach {goal}.', meter: 0.68, delta: 'Coins banked, growing' },
  { key: 'sale', art: { prop: 'billboard' }, name: 'SALE sign', action: 'Swipe ↓ to slide under it', effect: 'bad', text: 'An impulse buy. Hit it and you spend coins on things you didn’t plan for, so {goal} slips further away.', meter: 0.5, delta: 'Coins lost' },
  { key: 'fee', art: { prop: 'feeToll' }, name: 'FEE booth', action: 'Swipe ↑ to jump over it', effect: 'bad', text: 'Fees take a little every time you pay them. Small cuts add up to a lot.', meter: 0.44, delta: 'Coins lost' },
  { key: 'tip', art: { prop: 'hotTip' }, name: 'HOT TIP', action: 'Swipe ← → to dodge it', effect: 'bad', text: 'Dash’s “sure thing”. Following tips you don’t understand loses money fast.', meter: 0.36, delta: 'Coins lost' },
  { key: 'melt', art: { character: 'melt' }, name: 'The Melt = inflation', action: 'Keep running, bank often', effect: 'bad', text: 'Prices rise every year, so idle money buys less. The Melt chases you and shrinks coins you haven’t banked.', meter: 0.3, delta: 'Idle coins shrink' },
  { key: 'dash', art: { character: 'dash' }, name: 'Dash the hare', action: 'Stay steady', effect: 'neutral', text: 'He zooms past whenever you slip or leave coins on the road. Steady wins: bank often and keep him behind you!', meter: 0.45 },
];

const EFFECT = {
  good: { label: '✅ Closer to your goal', color: colors.kipDark, bg: colors.kipLight, border: colors.kip },
  bad: { label: '❌ Further from your goal', color: colors.dashDark, bg: colors.dashLight, border: colors.dash },
  neutral: { label: '', color: colors.ink, bg: colors.surface, border: colors.line },
} as const;

export function RunGuide({ onDone }: { onDone: () => void }) {
  const goal = useGame((s) => s.profile.goal);
  const targetAge = useGame((s) => s.profile.targetAge);
  const [i, setI] = useState(0);
  const step = RUN_GUIDE_STEPS[i];
  const last = i === RUN_GUIDE_STEPS.length - 1;
  const fx = EFFECT[step.effect];
  // "your 💻 Laptop goal" (the short name reads naturally mid-sentence).
  const goalName = goal ? `your ${goalOf(goal).emoji} ${goal === 'free40' ? goalOf(goal).label : goalOf(goal).short} goal` : 'your goal';
  const text = step.text.replace('{goal}', goalName);

  return (
    <View style={{ gap: space(1.5) }} testID="run-guide">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[type.tiny, { color: colors.kipDark, fontWeight: '900', letterSpacing: 1 }]}>
          HOW KIP RUN WORKS · {i + 1}/{RUN_GUIDE_STEPS.length}
        </Text>
        {!last ? (
          <Pressable onPress={onDone} accessibilityRole="button" hitSlop={10}>
            <Text style={[type.small, { color: colors.inkSoft, fontWeight: '800' }]}>Skip</Text>
          </Pressable>
        ) : null}
      </View>

      <Card style={{ alignItems: 'center', gap: space(1), borderColor: fx.border, backgroundColor: step.effect === 'neutral' ? colors.surface : fx.bg }}>
        <View style={{ height: 130, justifyContent: 'center', alignItems: 'center' }} accessible={false}>
          {'prop' in step.art ? (
            <Image source={PROPS[step.art.prop]} style={{ width: 130, height: 130 }} contentFit="contain" />
          ) : (
            <Character name={step.art.character} mood={step.art.character === 'dash' ? 'cheer' : 'happy'} size={124} />
          )}
        </View>
        <Text style={type.h2}>{step.name}</Text>
        <View style={{ backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 }}>
          <Text style={[type.small, { color: '#fff', fontWeight: '800' }]}>{step.action}</Text>
        </View>
        <Text style={[type.body, { textAlign: 'center' }]}>{text}</Text>
        {fx.label ? <Text style={[type.bodyBold, { color: fx.color }]}>{fx.label}</Text> : null}
      </Card>

      {/* The goal meter: good moves push it up, slips pull it down. */}
      <View style={{ gap: 6 }} accessibilityLabel={`Goal meter: ${Math.round(step.meter * 100)}%`}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[type.tiny, { fontWeight: '800', color: colors.ink }]}>{goal ? `${goalOf(goal).emoji} ${goalShort(goal, targetAge)}` : 'Your goal'}</Text>
          {step.delta ? <Text style={[type.tiny, { fontWeight: '800', color: fx.color }]}>{step.effect === 'good' ? '▲' : '▼'} {step.delta}</Text> : null}
        </View>
        <ProgressBar value={step.meter} color={step.effect === 'bad' ? colors.dash : colors.kip} height={12} />
      </View>

      {/* Step dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        {RUN_GUIDE_STEPS.map((s, k) => (
          <View key={s.key} style={{ width: k === i ? 18 : 8, height: 8, borderRadius: 4, backgroundColor: k <= i ? colors.kip : colors.line }} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: space(1) }}>
        {i > 0 ? <Button title="Back" variant="secondary" style={{ flex: 1 }} onPress={() => setI(i - 1)} /> : null}
        <Button testID="run-guide-next" title={last ? 'Got it!' : 'Next'} style={{ flex: 2 }} onPress={() => (last ? onDone() : setI(i + 1))} />
      </View>
    </View>
  );
}
