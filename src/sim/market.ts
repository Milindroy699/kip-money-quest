import type { AssetProfile } from './assets';
import { normal, type Rng } from './rng';

/** Monthly returns drawn from a lognormal model whose mean annual return matches the profile. */
export function monthlyReturns(profile: Pick<AssetProfile, 'expectedReturn' | 'volatility'>, months: number, rng: Rng): number[] {
  const sigma = profile.volatility / Math.sqrt(12);
  const mu = Math.log(1 + profile.expectedReturn) / 12 - (sigma * sigma) / 2;
  return Array.from({ length: months }, () => Math.exp(mu + sigma * normal(rng)) - 1);
}

/** Turns returns into a price path starting at `start` (length = returns + 1). */
export function pricePath(returns: number[], start = 100): number[] {
  const prices = [start];
  for (const r of returns) prices.push(prices[prices.length - 1] * (1 + r));
  return prices;
}

export interface InvestResult {
  invested: number;
  finalValue: number;
  /** Value at the end of each month (same length as prices). */
  values: number[];
}

/** Invest `monthly` at the start of each month at that month's price. */
export function runSip(prices: number[], monthly: number): InvestResult {
  let units = 0;
  let invested = 0;
  const values: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < prices.length - 1) {
      units += monthly / prices[i];
      invested += monthly;
    }
    values.push(units * prices[i]);
  }
  return { invested, finalValue: units * prices[prices.length - 1], values };
}

/** Invest everything at the first price. */
export function runLumpSum(prices: number[], amount: number): InvestResult {
  const units = amount / prices[0];
  return { invested: amount, finalValue: units * prices[prices.length - 1], values: prices.map((p) => units * p) };
}

/** Largest peak-to-trough fall as a fraction (0.3 = fell 30% from a peak). */
export function maxDrawdown(values: number[]): number {
  let peak = -Infinity;
  let worst = 0;
  for (const v of values) {
    peak = Math.max(peak, v);
    if (peak > 0) worst = Math.max(worst, (peak - v) / peak);
  }
  return worst;
}

export type MarketShape = 'rising' | 'choppy' | 'falling-then-recovering';

/**
 * Hand-shaped teaching paths for the Lump sum vs SIP lesson. Deterministic so the lesson
 * always shows the same story: lump sum wins in a steady rise, SIP wins when prices dip first.
 */
export function teachingPath(shape: MarketShape, months = 36): number[] {
  return Array.from({ length: months + 1 }, (_, m) => {
    const t = m / months;
    switch (shape) {
      case 'rising':
        return 100 * Math.pow(1.12, t * (months / 12));
      case 'choppy':
        return 100 * (1 + 0.25 * t) + 14 * Math.sin(t * Math.PI * 6);
      case 'falling-then-recovering':
        // Falls 100 → 60 over the first 40% of the time, then recovers to 115.
        return t < 0.4 ? 100 - 40 * (t / 0.4) : 60 + 55 * ((t - 0.4) / 0.6);
    }
  });
}
