/**
 * Rebalance Rush (World 5): each market year pushes your mix off target; you have a few seconds
 * to sell what grew and buy what shrank. A "drift twin" that never rebalances lives the same
 * years, so you can compare: rebalancing keeps the risk you chose (smaller worst drops), and by
 * rule makes you sell high and buy low. It doesn't always earn more, and the debrief says so.
 */
import { createRng, shuffle } from '../sim/rng';

export type Asset = 'shares' | 'bonds' | 'gold';
export const ASSETS_ORDER: Asset[] = ['shares', 'bonds', 'gold'];
export const ASSET_INFO: Record<Asset, { emoji: string; name: string }> = {
  shares: { emoji: '📈', name: 'Shares' },
  bonds: { emoji: '📜', name: 'Bonds' },
  gold: { emoji: '🥇', name: 'Gold' },
};

export const TARGET: Record<Asset, number> = { shares: 0.6, bonds: 0.3, gold: 0.1 };
export const RUSH = { rounds: 6, seconds: 10, step: 0.05, tolerance: 0.05, start: 100000 };

export interface MarketYear {
  id: string;
  emoji: string;
  name: string;
  returns: Record<Asset, number>;
}

export const YEARS: Record<string, MarketYear> = {
  boom: { id: 'boom', emoji: '🎆', name: 'Boom year', returns: { shares: 0.36, bonds: 0.04, gold: -0.05 } },
  crash: { id: 'crash', emoji: '👺', name: 'Crash', returns: { shares: -0.32, bonds: 0.07, gold: 0.2 } },
  recovery: { id: 'recovery', emoji: '🌱', name: 'Recovery', returns: { shares: 0.28, bonds: 0.05, gold: -0.06 } },
  rates: { id: 'rates', emoji: '🗿', name: 'Rate hike', returns: { shares: -0.08, bonds: -0.1, gold: 0.04 } },
  goldRush: { id: 'goldRush', emoji: '🥇', name: 'Gold rush', returns: { shares: 0.02, bonds: 0.05, gold: 0.35 } },
  steady: { id: 'steady', emoji: '🌤️', name: 'Steady year', returns: { shares: 0.11, bonds: 0.07, gold: 0.04 } },
};

/**
 * Six years from a seed. Every game has a boom followed (sooner or later) by a crash, because
 * that's when rebalancing matters most; the rest are shuffled.
 */
export function yearsFor(seed: number): MarketYear[] {
  const rng = createRng(seed);
  const rest = shuffle(rng, ['recovery', 'rates', 'goldRush', 'steady']);
  const boomAt = Math.floor(rng() * 3); // 0–2
  const crashAt = boomAt + 1 + Math.floor(rng() * 2); // 1–2 years after the boom
  const ids: string[] = [];
  for (let i = 0, r = 0; i < RUSH.rounds; i++) ids.push(i === boomAt ? 'boom' : i === crashAt ? 'crash' : rest[r++ % rest.length]);
  return ids.map((id) => YEARS[id]);
}

/** Rupees in each asset, plus cash waiting to be placed mid-rebalance. */
export type Mix = Record<Asset, number> & { cash: number };

export const startMix = (amount = RUSH.start): Mix => ({ shares: amount * TARGET.shares, bonds: amount * TARGET.bonds, gold: amount * TARGET.gold, cash: 0 });

export const total = (m: Mix) => m.shares + m.bonds + m.gold + m.cash;

export const weight = (m: Mix, a: Asset) => m[a] / total(m);

/** Applies a market year (idle cash earns nothing). */
export function grow(m: Mix, year: MarketYear): Mix {
  return { shares: m.shares * (1 + year.returns.shares), bonds: m.bonds * (1 + year.returns.bonds), gold: m.gold * (1 + year.returns.gold), cash: m.cash };
}

/** How far an asset is from plan, in whole percentage points (what the player sees). */
export const offBy = (m: Mix, a: Asset) => Math.round((m[a] / total(m)) * 100) - Math.round(TARGET[a] * 100);

/** Every asset within tolerance of target (as shown, in whole points), and (almost) no cash left unplaced. */
export function onTarget(m: Mix): boolean {
  return m.cash / total(m) < RUSH.step / 2 && ASSETS_ORDER.every((a) => Math.abs(offBy(m, a)) <= RUSH.tolerance * 100);
}

/** Sell one step (5% of the whole portfolio) of an asset into cash. */
export function sell(m: Mix, a: Asset): Mix {
  const amount = Math.min(m[a], total(m) * RUSH.step);
  return { ...m, [a]: m[a] - amount, cash: m.cash + amount };
}

/** Buy one step of an asset with waiting cash. */
export function buy(m: Mix, a: Asset): Mix {
  const amount = Math.min(m.cash, total(m) * RUSH.step);
  return { ...m, [a]: m[a] + amount, cash: m.cash - amount };
}

/** When time runs out, unplaced cash goes back in proportion to what you hold now. */
export function settleCash(m: Mix): Mix {
  if (m.cash <= 0) return m;
  const held = m.shares + m.bonds + m.gold;
  if (held <= 0) return { shares: m.cash * TARGET.shares, bonds: m.cash * TARGET.bonds, gold: m.cash * TARGET.gold, cash: 0 };
  return { shares: m.shares + (m.cash * m.shares) / held, bonds: m.bonds + (m.cash * m.bonds) / held, gold: m.gold + (m.cash * m.gold) / held, cash: 0 };
}

/** A perfect rebalance (what Kip would do). */
export const rebalanced = (m: Mix): Mix => startMix(total(m));

/** The biggest fall from a previous high, as a share (0.2 = −20%). */
export function worstDrop(values: number[]): number {
  let peak = values[0] ?? 0;
  let worst = 0;
  for (const v of values) {
    peak = Math.max(peak, v);
    worst = Math.max(worst, peak > 0 ? 1 - v / peak : 0);
  }
  return worst;
}

/** The never-rebalance twin over the same years: its values year by year, and the most it ever had in shares. */
export function driftTwin(years: MarketYear[]): { values: number[]; peakShares: number } {
  let m = startMix();
  const values = [total(m)];
  let peakShares = TARGET.shares;
  for (const y of years) {
    m = grow(m, y);
    values.push(total(m));
    peakShares = Math.max(peakShares, weight(m, 'shares'));
  }
  return { values, peakShares };
}

/** Kip's rebalance-every-year path over the same years. */
export function rebalancerPath(years: MarketYear[]): number[] {
  let m = startMix();
  const values = [total(m)];
  for (const y of years) {
    m = rebalanced(grow(m, y));
    values.push(total(m));
  }
  return values;
}
