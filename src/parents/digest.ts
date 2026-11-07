/**
 * The weekly report for parents: what the player did and learned this week, and a few questions
 * to ask at dinner. Shared from the phone (WhatsApp, email); automatic emails need a server later.
 */
import { getLesson, getWorldOfLesson, nextLesson, type Track } from '../content';
import { addDays, daysBetween, type DayKey } from '../engagement/days';
import { finIQBand } from '../engagement/rewards';

/** One dinner-table question per world, about what that world teaches. */
const TALK: Record<string, string> = {
  w0: 'What problem did money solve that swapping things (barter) couldn’t?',
  w1: 'If prices rise 6% a year, what happens to money kept in a drawer?',
  w2: 'Why does starting a SIP at 15 beat starting at 25, even with the same money?',
  w3: 'What’s the difference between a market dip and a permanent loss? Where should emergency money live?',
  w4: 'What’s the difference between owning a share and owning a bond?',
  w5: 'Why might someone keep some money in bonds or gold even though shares grow faster?',
  w6: 'Is buying a stock because a friend says it will “go to the moon” investing, or speculation?',
  w7: 'Why do people who trade every day usually do worse than people who hold for years?',
  w8: 'What does a P/E ratio tell you, and why is a “cheap” share not always a bargain?',
  w9: 'At your first job, what should come first: an emergency fund, insurance, or investing?',
};

export interface DigestInput {
  name: string;
  today: DayKey;
  lessons: Record<string, { completedDay: DayKey }>;
  streak: { count: number; activeDays: DayKey[] };
  finiq: number;
  portfolio: { value: number; principal: number } | null;
  track?: Track;
}

export interface WeeklyDigest {
  name: string;
  from: DayKey;
  to: DayKey;
  activeDays: number;
  streak: number;
  learned: { title: string; capability: string }[];
  totalLessons: number;
  finiq: number;
  band: string;
  portfolio: { value: number; principal: number } | null;
  next: string | null;
  questions: string[];
  /** Plain text for sharing. */
  text: string;
}

export function weeklyDigest(input: DigestInput): WeeklyDigest {
  const from = addDays(input.today, -6);
  const inWeek = (d: DayKey) => daysBetween(from, d) >= 0 && daysBetween(d, input.today) >= 0;
  const ids = Object.entries(input.lessons)
    .filter(([, r]) => inWeek(r.completedDay))
    .map(([id]) => id);
  const learned = ids.map((id) => getLesson(id)).filter((l): l is NonNullable<typeof l> => !!l).map((l) => ({ title: l.title, capability: l.capability }));
  const worlds = Array.from(new Set(ids.map((id) => getWorldOfLesson(id)?.id).filter((w): w is string => !!w)));
  const questions = (worlds.length ? worlds : ['w1']).map((w) => TALK[w]).filter(Boolean).slice(0, 3);
  const activeDays = new Set(input.streak.activeDays.filter(inWeek)).size;
  const next = nextLesson(input.lessons, input.track)?.title ?? null;
  const band = finIQBand(input.finiq).name;
  const name = input.name || 'Your teen';

  const lines = [
    `📊 ${name}'s week in Kip: Money Quest`,
    `${activeDays} of 7 days active · ${input.streak.count}-day streak · FinIQ ${input.finiq} (${band})`,
    learned.length ? `Learned this week:\n${learned.map((l) => `• ${l.capability}`).join('\n')}` : 'No new lessons this week. A good week to restart with one 3-minute lesson.',
    input.portfolio && input.portfolio.principal > 0
      ? `Practice portfolio (game coins, not real money): ${Math.round(input.portfolio.value)} coins from ${Math.round(input.portfolio.principal)} invested.`
      : null,
    next ? `Next up: ${next}` : null,
    `Ask at dinner:\n${questions.map((q) => `• ${q}`).join('\n')}`,
    'Education only: no real money, no trading and no advice.',
  ].filter(Boolean);

  return {
    name,
    from,
    to: input.today,
    activeDays,
    streak: input.streak.count,
    learned,
    totalLessons: Object.keys(input.lessons).length,
    finiq: input.finiq,
    band,
    portfolio: input.portfolio,
    next,
    questions,
    text: lines.join('\n\n'),
  };
}
