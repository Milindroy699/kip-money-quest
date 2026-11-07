/**
 * Market Duel: both players get the same goal brief and the same market years (same seed).
 * Each builds a 5-chip portfolio from the duel deck; the score rewards reaching the goal, a calm
 * ride and having cash when it's needed, never raw return. A reckless all-in can't win on average.
 *
 * Fairness: returns for every asset in every year are drawn once from the seed, so the only
 * difference between players is their choices.
 */
import { ASSETS, DEFAULT_INFLATION, type AssetClass } from '../sim/assets';
import { MARKET_EVENTS, type MarketEvent } from '../sim/events';
import { maxDrawdown } from '../sim/market';
import { createRng, hashSeed, normal, pick } from '../sim/rng';
import { scoreGoal, type GoalScore, type PortfolioRun } from '../sim/scoring';

export const DUEL_DECK: AssetClass[] = ['savings', 'fd', 'govBond', 'indexFund', 'gold', 'stock', 'reit', 'crypto'];
export const CHIPS = 5;

export interface DuelBrief {
  id: string;
  title: string;
  /** Who it's for and what they need. */
  story: string;
  years: number;
  start: number;
  /** Target in today's money (after inflation). */
  goal: number;
  /** Year (1-based) when cash is needed, if any. */
  cashNeedYear?: number;
}

export const BRIEFS: DuelBrief[] = [
  { id: 'laptop', title: 'Laptop fund', story: 'Grow ₹50,000 into a ₹56,000 laptop (today’s prices) in 3 years.', years: 3, start: 50000, goal: 56000 },
  { id: 'college', title: 'College fees', story: 'Turn ₹1,00,000 into ₹1,25,000 in today’s money within 5 years.', years: 5, start: 100000, goal: 125000 },
  { id: 'trip', title: 'Trip with a twist', story: 'Grow ₹40,000 to ₹44,000 in 3 years, and you’ll need some cash in year 2.', years: 3, start: 40000, goal: 44000, cashNeedYear: 2 },
  { id: 'business', title: 'Business seed money', story: 'Grow ₹30,000 to ₹38,000 in today’s money within 5 years.', years: 5, start: 30000, goal: 38000 },
];

export interface DuelSetup {
  seed: number;
  brief: DuelBrief;
  events: MarketEvent[];
  /** returns[year][asset] = that asset's return in that year (shared by both players). */
  returns: Record<AssetClass, number>[];
}

/** Everything about a duel follows from its seed. */
export function setupDuel(seed: number): DuelSetup {
  const rng = createRng(seed);
  const brief = pick(rng, BRIEFS);
  const events: MarketEvent[] = [];
  const returns: Record<AssetClass, number>[] = [];
  for (let y = 1; y <= brief.years; y++) {
    const ordinary = MARKET_EVENTS.filter((e) => !e.cashNeed);
    const base = pick(rng, ordinary);
    const event = brief.cashNeedYear === y ? { ...MARKET_EVENTS.find((e) => e.id === 'emergency')!, shocks: base.shocks, title: `${base.title} + a surprise expense` } : base;
    events.push(event);
    const yearReturns = {} as Record<AssetClass, number>;
    for (const a of DUEL_DECK) {
      const p = ASSETS[a];
      yearReturns[a] = Math.max(p.expectedReturn + p.volatility * normal(rng) + (event.shocks[a] ?? 0), -0.95);
    }
    returns.push(yearReturns);
  }
  return { seed, brief, events, returns };
}

/** A chip placement: asset → number of chips (5 in total). */
export type Chips = Partial<Record<AssetClass, number>>;

export const chipCount = (chips: Chips) => Object.values(chips).reduce((s, n) => s + (n ?? 0), 0);

export interface DuelResult {
  values: number[];
  run: PortfolioRun;
  score: GoalScore;
}

export function playDuel(setup: DuelSetup, chips: Chips): DuelResult {
  const total = chipCount(chips);
  if (total !== CHIPS) throw new Error(`A duel portfolio needs exactly ${CHIPS} chips`);
  const weights = (Object.entries(chips) as [AssetClass, number][]).filter(([, n]) => n > 0).map(([a, n]) => [a, n / total] as const);
  let value = setup.brief.start;
  const values = [value];
  let liquidityMet = true;
  setup.events.forEach((event, y) => {
    const growth = weights.reduce((g, [a, w]) => g + w * setup.returns[y][a], 0);
    value *= 1 + growth;
    if (event.cashNeed) {
      const liquid = weights.filter(([a]) => ASSETS[a].liquidity >= 4).reduce((s, [, w]) => s + w, 0);
      if (liquid < 0.2) liquidityMet = false; // at least one chip somewhere you can get to quickly
    }
    values.push(value);
  });
  const run: PortfolioRun = { values, finalValue: value, maxDrawdown: maxDrawdown(values), liquidityMet };
  // The goal is in today's money; compare it with the start in today's money too.
  const score = scoreGoal(run, setup.brief.goal, setup.brief.years, DEFAULT_INFLATION);
  return { values, run, score };
}

/** Dash always goes for the thrill: crypto and single shares. */
export function dashChips(seed: number): Chips {
  const styles: Chips[] = [{ crypto: 3, stock: 2 }, { crypto: 5 }, { stock: 4, crypto: 1 }, { crypto: 2, stock: 2, gold: 1 }];
  return styles[seed % styles.length];
}

export function newDuelSeed(salt: string): number {
  return hashSeed(`duel:${salt}:${Date.now()}`);
}

/** Kip's debrief: why each portfolio scored what it did. */
export function duelDebrief(setup: DuelSetup, mine: DuelResult, theirs: DuelResult): string[] {
  const lines: string[] = [];
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  lines.push(`Goal points: you ${mine.score.goalPoints}/60, them ${theirs.score.goalPoints}/60. Beating the goal by more earns nothing extra.`);
  lines.push(`Biggest drop: you ${pct(mine.run.maxDrawdown)}, them ${pct(theirs.run.maxDrawdown)}. A calmer ride scores more.`);
  if (setup.brief.cashNeedYear) {
    lines.push(mine.run.liquidityMet ? 'You kept cash you could reach for the surprise expense.' : 'The surprise expense found no easy cash in your portfolio, so you lost the liquidity points.');
  }
  const crash = setup.events.findIndex((e) => e.id === 'crash' || e.title.startsWith('Market Crash'));
  if (crash >= 0) lines.push(`Year ${crash + 1} brought a crash. Spread-out portfolios fell less.`);
  return lines;
}
