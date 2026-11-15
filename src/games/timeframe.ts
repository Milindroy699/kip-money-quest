/**
 * Timeframe Racer (World 7): the same market, played fast and slow. Scalping pays a cost on every
 * trade and fights noise; holding for years lets the small upward drift compound.
 */
import { ASSETS } from '../sim/assets';
import { monthlyReturns } from '../sim/market';
import { createRng, normal } from '../sim/rng';

export const SCALP = { ticks: 36, costPerTrade: 0.001, stake: 10000 };

/** A noisy intraday price path (tiny drift, lots of noise). */
export function scalpTicks(seed: number, count = SCALP.ticks): number[] {
  const rng = createRng(seed);
  let p = 100;
  return Array.from({ length: count }, () => (p *= 1 + 0.0004 + 0.003 * normal(rng)));
}

/** Net result of round trips (buy index, sell index) after costs, on a ₹10,000 stake. */
export function scalpResult(prices: number[], trips: [number, number][]): { net: number; costs: number; trades: number } {
  let value = SCALP.stake;
  let costs = 0;
  for (const [buy, sell] of trips) {
    const cost = value * SCALP.costPerTrade * 2;
    costs += cost;
    value = value * (prices[sell] / prices[buy]) - cost;
  }
  return { net: Math.round(value - SCALP.stake), costs: Math.round(costs), trades: trips.length * 2 };
}

/** Five years of holding an index fund, month by month, on the same stake. */
export function holdPath(seed: number, years = 5): number[] {
  const rng = createRng(seed ^ 0x9e3779b9);
  const r = monthlyReturns(ASSETS.indexFund, years * 12, rng);
  const out = [SCALP.stake];
  for (const x of r) out.push(out[out.length - 1] * (1 + x));
  return out;
}
