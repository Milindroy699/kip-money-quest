/**
 * Practice Portfolio: invest coins in the product cards you've unlocked and watch them move.
 * 1 real day = 1 market month, so a year of investing plays out over 12 days.
 *
 * The market is shared: every player sees the same returns on the same day (seeded by the
 * month number), which keeps it fair for leagues later and gives everyone the same "crash day"
 * to talk about. Returns are HYPOTHETICAL, drawn from the illustrative profiles in src/sim/assets.
 *
 * Pure functions only; the store calls these (src/state/game.ts).
 */
import { ASSETS, DEFAULT_INFLATION, type AssetClass } from '../sim/assets';
import { MARKET_EVENTS, type MarketEvent } from '../sim/events';
import { createRng, hashSeed, normal } from '../sim/rng';

export type ProductAsset = AssetClass | 'mutualFund' | 'elss';

export interface Product {
  /** Card id that unlocks it. */
  cardId: string;
  asset: ProductAsset;
  /** Months before it can be taken out without a penalty. */
  lockMonths: number;
  /** What happens before the lock ends. */
  earlyExit: 'free' | 'penalty' | 'locked';
  /** Share of value lost when breaking early. */
  penalty: number;
  /** One-line rule shown before investing. */
  rule: string;
}

export const PRODUCTS: Record<string, Product> = {
  savings: { cardId: 'savings', asset: 'savings', lockMonths: 0, earlyExit: 'free', penalty: 0, rule: 'Take it out any time. Low return.' },
  fd: { cardId: 'fd', asset: 'fd', lockMonths: 12, earlyExit: 'penalty', penalty: 0.01, rule: 'Fixed for 12 months. Breaking it early costs 1%.' },
  rd: { cardId: 'rd', asset: 'rd', lockMonths: 12, earlyExit: 'penalty', penalty: 0.01, rule: 'Fixed for 12 months. Breaking it early costs 1%.' },
  ppf: { cardId: 'ppf', asset: 'ppf', lockMonths: 84, earlyExit: 'locked', penalty: 0, rule: 'Locked for 7 years (84 days here). Safe, steady, can’t touch it.' },
  elss: { cardId: 'elss', asset: 'elss', lockMonths: 36, earlyExit: 'locked', penalty: 0, rule: 'Shares, locked for 3 years (36 days here). Swings, and can’t be touched.' },
  indexFund: { cardId: 'indexFund', asset: 'indexFund', lockMonths: 0, earlyExit: 'free', penalty: 0, rule: 'The whole market. Swings, but grows over time. Out any time.' },
  mutualFund: { cardId: 'mutualFund', asset: 'mutualFund', lockMonths: 0, earlyExit: 'free', penalty: 0, rule: 'A manager picks shares for you, for a fee. Swings. Out any time.' },
  govBond: { cardId: 'govBond', asset: 'govBond', lockMonths: 0, earlyExit: 'free', penalty: 0, rule: 'A loan to the government. Small swings. Out any time.' },
  gold: { cardId: 'gold', asset: 'gold', lockMonths: 0, earlyExit: 'free', penalty: 0, rule: 'Shines when others panic. Swings. Out any time.' },
  stock: { cardId: 'stock', asset: 'stock', lockMonths: 0, earlyExit: 'free', penalty: 0, rule: 'One company. Big swings, both ways. Out any time.' },
  reit: { cardId: 'reit', asset: 'reit', lockMonths: 0, earlyExit: 'free', penalty: 0, rule: 'Rent from big buildings. Swings. Out any time.' },
  crypto: { cardId: 'crypto', asset: 'crypto', lockMonths: 0, earlyExit: 'free', penalty: 0, rule: 'Wild swings. Can halve in a month. Out any time.' },
  peVc: { cardId: 'peVc', asset: 'peVc', lockMonths: 96, earlyExit: 'locked', penalty: 0, rule: 'Young companies. Locked 8 years (96 days here). Big risk.' },
};

/** Cards that can be invested in (strategies like SIP aren't products). */
export function investableCards(owned: string[]): string[] {
  return owned.filter((c) => PRODUCTS[c]);
}

const EXTRA_PROFILES: Record<'mutualFund' | 'elss', { expectedReturn: number; volatility: number }> = {
  mutualFund: { expectedReturn: 0.115, volatility: 0.18 },
  elss: { expectedReturn: 0.12, volatility: 0.19 },
};

function profileOf(asset: ProductAsset) {
  return asset === 'mutualFund' || asset === 'elss' ? EXTRA_PROFILES[asset] : ASSETS[asset];
}

/** How strongly each asset follows the overall share market (so a crash hits them together). */
const MARKET_LINK: Partial<Record<ProductAsset, number>> = {
  indexFund: 0.95,
  mutualFund: 0.9,
  elss: 0.9,
  stock: 0.75,
  reit: 0.6,
  peVc: 0.5,
  crypto: 0.4,
  govBond: 0.1,
  gold: -0.2,
};

/**
 * Market events, as rare per-month chances. Shocks are softened because a "month" here is a day.
 * Crashes are deeper but rarer than booms, so for shares they roughly cancel out over time:
 * events add drama without changing the long-run average.
 */
const EVENT_CHANCE: [id: string, chance: number][] = [
  ['crash', 0.02],
  ['boom', 0.033],
  ['rateHike', 0.042],
  ['inflationSpike', 0.033],
];
const SHOCK_SCALE = 0.7;
const FIXED = new Set<ProductAsset>(['savings', 'fd', 'rd', 'ppf']);

export interface MarketMonth {
  month: number;
  returns: Record<ProductAsset, number>;
  event: MarketEvent | null;
}

const cache = new Map<number, MarketMonth>();

/** The shared market for one month (deterministic: everyone sees the same). */
export function marketMonth(month: number): MarketMonth {
  const hit = cache.get(month);
  if (hit) return hit;
  const rng = createRng(hashSeed(`kip-market:${month}`));
  const market = normal(rng);
  const roll = rng();
  let acc = 0;
  let event: MarketEvent | null = null;
  for (const [id, chance] of EVENT_CHANCE) {
    acc += chance;
    if (roll < acc) {
      event = MARKET_EVENTS.find((e) => e.id === id) ?? null;
      break;
    }
  }
  const returns = {} as Record<ProductAsset, number>;
  for (const asset of Object.values(PRODUCTS).map((p) => p.asset)) {
    const { expectedReturn, volatility } = profileOf(asset);
    let r: number;
    if (FIXED.has(asset) || volatility === 0) {
      r = Math.pow(1 + expectedReturn, 1 / 12) - 1;
    } else {
      const sigma = volatility / Math.sqrt(12);
      const mu = Math.log(1 + expectedReturn) / 12 - (sigma * sigma) / 2;
      const link = MARKET_LINK[asset] ?? 0;
      const z = link * market + Math.sqrt(1 - link * link) * normal(rng);
      r = Math.exp(mu + sigma * z) - 1;
      const shockKey: AssetClass = asset === 'mutualFund' || asset === 'elss' ? 'indexFund' : asset;
      if (event) r += (event.shocks[shockKey] ?? 0) * SHOCK_SCALE;
    }
    returns[asset] = Math.max(r, -0.9);
  }
  const result = { month, returns, event };
  cache.set(month, result);
  return result;
}

// ---- Holdings -------------------------------------------------------------------------

export interface Lot {
  id: number;
  cardId: string;
  /** Coins put in. */
  principal: number;
  /** Current value in coins (fractional). */
  value: number;
  /** Month it was bought; it starts moving the month after. */
  boughtMonth: number;
}

export interface PortfolioState {
  lots: Lot[];
  /** Last month already applied (null = never). */
  settledMonth: number | null;
  /** Total value at the end of each settled day, newest last (capped). */
  history: { month: number; value: number }[];
  nextId: number;
}

export const emptyPortfolio: PortfolioState = { lots: [], settledMonth: null, history: [], nextId: 1 };

export const PORTFOLIO_LIMITS = { minInvest: 10, maxTotal: 2000, historyLength: 120, maxCatchUpMonths: 400 };

/** Day number used as the market month: 1 day = 1 month. */
export function monthOfDay(day: string): number {
  return Math.round((Date.parse(`${day}T00:00:00Z`) - Date.parse('2026-01-01T00:00:00Z')) / 86_400_000);
}

export const totalValue = (p: PortfolioState) => p.lots.reduce((s, l) => s + l.value, 0);
export const totalPrincipal = (p: PortfolioState) => p.lots.reduce((s, l) => s + l.principal, 0);

/** Applies every market month up to `month`. Idempotent: settling twice on a day changes nothing. */
export function settle(p: PortfolioState, month: number): PortfolioState {
  if (p.settledMonth !== null && month <= p.settledMonth) return p;
  const from = p.settledMonth === null ? month : Math.max(p.settledMonth + 1, month - PORTFOLIO_LIMITS.maxCatchUpMonths);
  let lots = p.lots;
  const history = [...p.history];
  for (let m = from; m <= month; m++) {
    const mkt = marketMonth(m);
    lots = lots.map((l) => (m > l.boughtMonth ? { ...l, value: l.value * (1 + mkt.returns[PRODUCTS[l.cardId].asset]) } : l));
    history.push({ month: m, value: lots.reduce((s, l) => s + l.value, 0) });
  }
  return { ...p, lots, settledMonth: month, history: history.slice(-PORTFOLIO_LIMITS.historyLength) };
}

export type InvestError = 'tooSmall' | 'notEnoughCoins' | 'overLimit' | 'notUnlocked';

export function invest(p: PortfolioState, cardId: string, amount: number, month: number, wallet: number, owned: string[]): { portfolio: PortfolioState; spent: number } | { error: InvestError } {
  if (!PRODUCTS[cardId] || !owned.includes(cardId)) return { error: 'notUnlocked' };
  if (amount < PORTFOLIO_LIMITS.minInvest) return { error: 'tooSmall' };
  if (amount > wallet) return { error: 'notEnoughCoins' };
  if (totalPrincipal(p) + amount > PORTFOLIO_LIMITS.maxTotal) return { error: 'overLimit' };
  const settled = settle(p, month);
  const lot: Lot = { id: settled.nextId, cardId, principal: amount, value: amount, boughtMonth: month };
  return { portfolio: { ...settled, lots: [...settled.lots, lot], nextId: settled.nextId + 1 }, spent: amount };
}

export interface ExitQuote {
  /** Coins you'd get back now. */
  payout: number;
  /** Coins lost to an early-exit penalty. */
  penalty: number;
  /** Months until it unlocks (0 = free now). */
  monthsLeft: number;
  /** False when it's locked and can't be taken out yet. */
  allowed: boolean;
}

export function exitQuote(lot: Lot, month: number): ExitQuote {
  const product = PRODUCTS[lot.cardId];
  const monthsLeft = Math.max(lot.boughtMonth + product.lockMonths - month, 0);
  if (monthsLeft === 0 || product.earlyExit === 'free') return { payout: Math.floor(lot.value), penalty: 0, monthsLeft: 0, allowed: true };
  if (product.earlyExit === 'locked') return { payout: 0, penalty: 0, monthsLeft, allowed: false };
  const penalty = lot.value * product.penalty;
  return { payout: Math.floor(lot.value - penalty), penalty: Math.ceil(penalty), monthsLeft, allowed: true };
}

export function withdraw(p: PortfolioState, lotId: number, month: number): { portfolio: PortfolioState; payout: number } | { error: 'locked' | 'missing' } {
  const settled = settle(p, month);
  const lot = settled.lots.find((l) => l.id === lotId);
  if (!lot) return { error: 'missing' };
  const quote = exitQuote(lot, month);
  if (!quote.allowed) return { error: 'locked' };
  return { portfolio: { ...settled, lots: settled.lots.filter((l) => l.id !== lotId) }, payout: quote.payout };
}

/** Value in today's coins after inflation (what it can actually buy). */
export function realValue(value: number, months: number): number {
  return value / Math.pow(1 + DEFAULT_INFLATION, months / 12);
}

/** Kip's coaching for the portfolio as it stands. */
export function coachNote(p: PortfolioState, month: number, owned: string[]): string {
  if (!p.lots.length) return 'Start small: put a few coins in two different products and come back tomorrow to see what a month in the market does.';
  const last = marketMonth(month);
  const recent = p.history.slice(-2);
  const dropped = recent.length === 2 && recent[1].value < recent[0].value * 0.92;
  if (last.event?.id === 'crash' || dropped) return 'The market dropped. Selling now locks in the loss. Investors who stay usually see it recover over time.';
  const total = totalValue(p);
  const byCard = new Map<string, number>();
  for (const l of p.lots) byCard.set(l.cardId, (byCard.get(l.cardId) ?? 0) + l.value);
  const [topCard, topValue] = [...byCard.entries()].sort((a, b) => b[1] - a[1])[0];
  const topAsset = PRODUCTS[topCard].asset;
  if (topValue / total > 0.8 && !FIXED.has(topAsset)) return 'Most of your coins are in one swingy product. Spreading across a few lowers the bumps.';
  if (topValue / total > 0.8 && topAsset === 'savings') return 'Savings are safe, but they grow slower than inflation. Coins you won’t need soon could work harder.';
  if (investableCards(owned).length > byCard.size + 1) return 'You’ve unlocked more products than you use. Each one teaches a different trade-off.';
  return 'Steady. Check back tomorrow: another month will have passed in the market.';
}
