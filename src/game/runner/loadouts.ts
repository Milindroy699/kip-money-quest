/**
 * Card loadouts: equip one product card before a run. Each card's real-world trait becomes
 * its power-up, so playing teaches what the product is like.
 */
import type { Loadout } from './engine';

export interface CardLoadout extends Loadout {
  /** One-line power-up shown in the picker. */
  power: string;
  /** The real-world trait it models. */
  trait: string;
}

export const CARD_LOADOUTS: Record<string, CardLoadout> = {
  cash: { id: 'cash', power: 'No power-up', trait: 'Cash just sits there, and The Melt bites it at full strength.' },
  savings: { id: 'savings', meltBiteFactor: 0.6, power: 'Idle coins melt 40% slower', trait: 'A little interest softens inflation, but doesn’t beat it.' },
  fd: { id: 'fd', shield: 1, endMultiplier: 1.05, power: '1 shield + 5% at the finish', trait: 'Safe and steady, with a small fixed return.' },
  rd: { id: 'rd', gateBonus: 0.05, power: '+5% every time you bank', trait: 'Small regular deposits add up.' },
  ppf: { id: 'ppf', endMultiplier: 1.3, blockCashOut: true, power: '+30% at the finish, CASH OUT locked', trait: 'Locked for years, rewarded at the end.' },
  indexFund: { id: 'indexFund', endMultiplier: { min: 0.8, max: 1.7 }, power: 'Finish swings −20% to +70%', trait: 'Higher growth over time, with ups and downs.' },
  sip: { id: 'sip', autoBankEvery: 8, power: 'Auto-banks idle coins every 8 s', trait: 'Investing on autopilot beats remembering.' },
  lumpSum: { id: 'lumpSum', headStart: 20, power: 'Start with 20 coins banked', trait: 'All your money working from day one.' },
};

/** Loadouts the player can pick from their owned cards (cash is always available). */
export function availableLoadouts(ownedCards: string[]): CardLoadout[] {
  const ids = Array.from(new Set(['cash', ...ownedCards])).filter((id) => CARD_LOADOUTS[id]);
  return ids.map((id) => CARD_LOADOUTS[id]);
}
