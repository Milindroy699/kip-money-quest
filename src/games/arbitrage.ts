/**
 * Arbitrage Rush (World 6), from the bitcoin-arbitrage principle: the same coin trades on two
 * exchanges. Buy on A and sell on B when the gap beats the fees, but the coins take a few ticks
 * to move between exchanges, and gaps often close before they arrive.
 */
import { createRng, normal } from '../sim/rng';

export const ARB = { trade: 100000, feeEachSide: 0.0025, delayTicks: 2, ticks: 30 };

export interface Tick {
  a: number;
  b: number;
}

/** Prices on both exchanges: A wanders; B's gap to A shrinks back towards zero, with sudden spikes. */
export function arbTicks(seed: number, count = ARB.ticks + ARB.delayTicks): Tick[] {
  const rng = createRng(seed);
  let a = 5000000;
  let gap = 0;
  const out: Tick[] = [];
  for (let i = 0; i < count; i++) {
    a *= 1 + 0.002 * normal(rng);
    gap = gap * 0.75 + 0.0015 * normal(rng);
    if (rng() < 0.12) gap += (rng() < 0.5 ? -1 : 1) * (0.008 + rng() * 0.012); // a sudden gap
    out.push({ a: Math.round(a), b: Math.round(a * (1 + gap)) });
  }
  return out;
}

export const gapOf = (t: Tick) => t.b / t.a - 1;

/** Profit in ₹ from buying ₹1,00,000 of coin on A at tick i and selling on B when it arrives. */
export function arbProfit(ticks: Tick[], i: number): number {
  const buy = ticks[i].a;
  const sell = ticks[Math.min(i + ARB.delayTicks, ticks.length - 1)].b;
  const coins = (ARB.trade * (1 - ARB.feeEachSide)) / buy;
  return Math.round(coins * sell * (1 - ARB.feeEachSide) - ARB.trade);
}
