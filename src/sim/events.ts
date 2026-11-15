import type { AssetClass } from './assets';
import { pick, type Rng } from './rng';

/** "Market Year" event cards used by Market Duel and live events. */
export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  /** One-off return shock added to that asset's return for the year (e.g. -0.3 = −30%). */
  shocks: Partial<Record<AssetClass, number>>;
  /** Extra inflation this year. */
  inflationShock?: number;
  /** True if the player may need cash this year (liquidity test). */
  cashNeed?: boolean;
}

export const MARKET_EVENTS: readonly MarketEvent[] = [
  {
    id: 'crash',
    title: 'Market Crash',
    description: 'Fear spreads. Shares fall hard, safe assets hold.',
    shocks: { stock: -0.35, indexFund: -0.25, reit: -0.2, crypto: -0.6, peVc: -0.3, derivative: -0.9, gold: 0.08 },
  },
  {
    id: 'boom',
    title: 'Tech Boom',
    description: 'A sector takes off. Shares and risky bets jump.',
    shocks: { stock: 0.3, indexFund: 0.15, crypto: 0.5, peVc: 0.25, derivative: 0.6 },
  },
  {
    id: 'rateHike',
    title: 'Rate Hike',
    description: 'The RBI raises rates to cool inflation. Bonds dip, new FDs pay more.',
    shocks: { govBond: -0.05, reit: -0.08, stock: -0.05, fd: 0.01 },
  },
  {
    id: 'inflationSpike',
    title: 'Inflation Spike',
    description: 'Prices jump. Gold shines, cash melts faster.',
    shocks: { gold: 0.12, cash: 0, savings: 0 },
    inflationShock: 0.04,
  },
  {
    id: 'emergency',
    title: 'Surprise Expense',
    description: 'The phone screen cracks. You need cash this year.',
    shocks: {},
    cashNeed: true,
  },
  {
    id: 'calm',
    title: 'Quiet Year',
    description: 'Nothing dramatic. Compounding does its quiet work.',
    shocks: {},
  },
];

/** Draws `count` event cards from a seed. Both duel players use the same seed. */
export function drawEvents(rng: Rng, count: number): MarketEvent[] {
  return Array.from({ length: count }, () => pick(rng, MARKET_EVENTS));
}
