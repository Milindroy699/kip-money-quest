/**
 * Payoff Puzzle (World 8): options strategies as shapes. Combine "legs" to match a target
 * profit-and-loss shape at expiry.
 */
export type Leg = 'stock' | 'buyPut' | 'sellCall' | 'buyCall' | 'buyPutAtm';

export const LEGS: Record<Leg, { name: string; emoji: string; note: string }> = {
  stock: { name: 'Own the share (at ₹100)', emoji: '📈', note: 'Gains and loses one for one with the price' },
  buyPut: { name: 'Buy a put (₹95, costs ₹3)', emoji: '🛡️', note: 'The right to sell at ₹95: a floor' },
  sellCall: { name: 'Sell a call (₹110, earns ₹3)', emoji: '💰', note: 'You get ₹3 now, but give up gains above ₹110' },
  buyCall: { name: 'Buy a call (₹100, costs ₹5)', emoji: '🚀', note: 'The right to buy at ₹100: gains if it rises' },
  buyPutAtm: { name: 'Buy a put (₹100, costs ₹5)', emoji: '🪂', note: 'The right to sell at ₹100: gains if it falls' },
};

export function legPayoff(leg: Leg, price: number): number {
  switch (leg) {
    case 'stock':
      return price - 100;
    case 'buyPut':
      return Math.max(95 - price, 0) - 3;
    case 'sellCall':
      return 3 - Math.max(price - 110, 0);
    case 'buyCall':
      return Math.max(price - 100, 0) - 5;
    case 'buyPutAtm':
      return Math.max(100 - price, 0) - 5;
  }
}

export const payoff = (legs: Leg[], price: number) => legs.reduce((s, l) => s + legPayoff(l, price), 0);

export interface Puzzle {
  id: string;
  name: string;
  goal: string;
  target: Leg[];
}

export const PUZZLES: Puzzle[] = [
  { id: 'protective', name: 'Protective put', goal: 'You own a share. Build a floor so a crash can’t hurt you much.', target: ['stock', 'buyPut'] },
  { id: 'covered', name: 'Covered call', goal: 'You own a share. Earn extra income now, giving up big gains.', target: ['stock', 'sellCall'] },
  { id: 'straddle', name: 'Straddle', goal: 'You expect a big move but don’t know which way. Profit either way.', target: ['buyCall', 'buyPutAtm'] },
];

export const PRICES = Array.from({ length: 17 }, (_, i) => 60 + i * 5);

/** Two leg sets match when their payoff lines are identical at every price. */
export function sameShape(a: Leg[], b: Leg[]): boolean {
  return a.length > 0 && PRICES.every((p) => Math.abs(payoff(a, p) - payoff(b, p)) < 1e-9);
}
