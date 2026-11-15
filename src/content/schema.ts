/** Content schema. Writers add lessons as JSON; this validates them at load time and in tests. */
import { z } from 'zod';

export const Speaker = z.enum(['kip', 'dash', 'melt']);
export const Mood = z.enum(['happy', 'talk', 'think', 'worry', 'cheer']);
export const Widget = z.enum([
  'barter', 'reveal', 'inflationShrink', 'realReturn', 'compoundChart', 'sipVsLump', 'riskLadder', 'lossOdds', 'liquidity', 'rateSeesaw', 'ownSlice', 'basket', 'feeDrag', 'bazaar',
  // Worlds 5–9
  'allocation', 'fortDefense', 'rebalance', 'rebalanceRush', 'hedge', 'intent', 'arbitrage', 'leverage', 'farmerHedge', 'tradeCosts', 'timeframe', 'ratioCalc', 'ratioDetective', 'candles', 'payoff', 'paycheck', 'retirement', 'startups',
]);
export const RunMode = z.enum(['inflation', 'snowball', 'risk', 'timeframe', 'chart']);

const StoryStep = z.object({
  type: z.literal('story'),
  speaker: Speaker,
  mood: Mood.optional(),
  lines: z.array(z.string().min(1)).min(1),
});

const RevealItem = z.object({ emoji: z.string(), title: z.string(), text: z.string() });

/** Predict-then-reveal: the player guesses before the widget shows the answer. */
const Prediction = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2).max(4),
  correct: z.number().int().min(0),
  reveal: z.string(),
});

const ConceptStep = z.object({
  type: z.literal('concept'),
  widget: Widget,
  title: z.string(),
  caption: z.string().optional(),
  params: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
  items: z.array(RevealItem).optional(),
  predict: Prediction.optional(),
});

const PlayStep = z.object({
  type: z.literal('play'),
  mode: RunMode,
  durationSec: z.number().min(15).max(120),
  brief: z.string(),
});

const QuizOption = z.object({ text: z.string(), correct: z.boolean().optional(), why: z.string() });

const QuizStep = z
  .object({
    type: z.literal('quiz'),
    question: z.string(),
    options: z.array(QuizOption).min(2).max(4),
  })
  .refine((q) => q.options.filter((o) => o.correct).length === 1, { message: 'Quiz must have exactly one correct option' });

const ConnectStep = z.object({
  type: z.literal('connect'),
  cardId: z.string().optional(),
  title: z.string(),
  realLife: z.string(),
  mission: z.string().optional(),
  /** Extra real-world detail shown only on the Builder track (16 and up). */
  deeper: z.string().optional(),
});

export const Step = z.union([StoryStep, ConceptStep, PlayStep, QuizStep, ConnectStep]);

export const Lesson = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  boss: z.boolean().optional(),
  unlockCards: z.array(z.string()).optional(),
  capability: z.string(),
  steps: z.array(Step).min(3),
});

export const World = z.object({
  id: z.string(),
  index: z.number(),
  title: z.string(),
  tagline: z.string(),
  principle: z.string(),
  product: z.string(),
  philosophy: z.string(),
  color: z.string(),
  /** Builder-only worlds (16 and up). Explorers skip them unless they switch track in You. */
  track: z.literal('builder').optional(),
  lessons: z.array(Lesson).min(1),
});

const Stat = z.number().int().min(1).max(5);

export const Card = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['asset', 'strategy']),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  emoji: z.string(),
  mentor: z.string().optional(),
  stats: z.object({ return: Stat, risk: Stat, liquidity: Stat, lockIn: Stat, complexity: Stat }).optional(),
  traits: z.array(z.string()).optional(),
  oneLiner: z.string(),
  realLife: z.string(),
  goodFor: z.array(z.string()),
  watchOut: z.array(z.string()),
  regulator: z.string().optional(),
  world: z.number(),
});

export type StepT = z.infer<typeof Step>;
export type LessonT = z.infer<typeof Lesson>;
export type WorldT = z.infer<typeof World>;
export type CardT = z.infer<typeof Card>;
export type MoodT = z.infer<typeof Mood>;
export type SpeakerT = z.infer<typeof Speaker>;
export type RunModeT = z.infer<typeof RunMode>;
