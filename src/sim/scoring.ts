import { ASSETS, DEFAULT_INFLATION, type AssetClass } from './assets';
import type { MarketEvent } from './events';
import { maxDrawdown } from './market';
import { normal, type Rng } from './rng';

export type Allocation = Partial<Record<AssetClass, number>>;

export interface PortfolioRun {
  /** Portfolio value at the start and end of each year. */
  values: number[];
  finalValue: number;
  maxDrawdown: number;
  /** True if every cash-need year could be met from liquid assets (liquidity ≥ 4). */
  liquidityMet: boolean;
}

function normalise(allocation: Allocation): [AssetClass, number][] {
  const entries = Object.entries(allocation).filter(([, w]) => (w ?? 0) > 0) as [AssetClass, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  if (total <= 0) throw new Error('Allocation must have a positive weight');
  return entries.map(([a, w]) => [a, w / total]);
}

/** Simulates a yearly-rebalanced portfolio through a list of market-year events. */
export function simulatePortfolio(allocation: Allocation, start: number, events: MarketEvent[], rng: Rng): PortfolioRun {
  const weights = normalise(allocation);
  let value = start;
  const values = [value];
  let liquidityMet = true;
  for (const event of events) {
    let growth = 0;
    for (const [asset, w] of weights) {
      const p = ASSETS[asset];
      const r = p.expectedReturn + p.volatility * normal(rng) + (event.shocks[asset] ?? 0);
      growth += w * Math.max(r, -1);
    }
    value = value * (1 + growth);
    if (event.cashNeed) {
      const liquidShare = weights.filter(([a]) => ASSETS[a].liquidity >= 4).reduce((s, [, w]) => s + w, 0);
      if (liquidShare < 0.1) liquidityMet = false;
    }
    values.push(value);
  }
  return { values, finalValue: value, maxDrawdown: maxDrawdown(values), liquidityMet };
}

export interface GoalScore {
  total: number;
  goalPoints: number;
  stabilityPoints: number;
  liquidityPoints: number;
}

/**
 * Goal-based, risk-aware score out of 100. Raw return beyond the goal earns nothing extra,
 * so a reckless all-in portfolio cannot win on average.
 */
export function scoreGoal(run: PortfolioRun, goal: number, years: number, inflation = DEFAULT_INFLATION): GoalScore {
  const realFinal = run.finalValue / Math.pow(1 + inflation, years);
  const goalPoints = Math.round(60 * Math.min(realFinal / goal, 1));
  const stabilityPoints = Math.round(25 * (1 - Math.min(run.maxDrawdown / 0.5, 1)));
  const liquidityPoints = run.liquidityMet ? 15 : 0;
  return { total: goalPoints + stabilityPoints + liquidityPoints, goalPoints, stabilityPoints, liquidityPoints };
}
