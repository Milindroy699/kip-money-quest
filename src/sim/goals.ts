/**
 * Goal Planner: turns a dream ("₹60,000 laptop by 25") into a plan.
 * All returns are hypothetical and labelled as such wherever they are shown.
 */
import { DEFAULT_INFLATION } from './assets';
import { inflatePrice } from './compounding';

/** Shorter goals need safer products, so the hypothetical return depends on the horizon. */
export function planReturnFor(years: number): { rate: number; product: string; why: string } {
  if (years < 3) return { rate: 0.07, product: 'Recurring Deposit or FD', why: 'Under 3 years, keep it safe: shares can fall just when you need the money.' };
  if (years < 7) return { rate: 0.09, product: 'A balanced mix (FD + index fund)', why: '3–7 years: some growth, some safety.' };
  return { rate: 0.12, product: 'Index fund SIP', why: '7+ years: time can ride out the ups and downs.' };
}

/**
 * A hypothetical risk mix for a goal (World 3): SAFE = FDs/RDs/savings, BALANCED = index funds,
 * WILD = single shares and other high-swing bets. Shorter goals stay safer.
 */
export function riskMixFor(years: number): { safe: number; balanced: number; wild: number; why: string } {
  if (years < 3) return { safe: 85, balanced: 15, wild: 0, why: 'Under 3 years: a crash could hit just before you need it, so keep it mostly safe.' };
  if (years < 7) return { safe: 50, balanced: 45, wild: 5, why: '3–7 years: some growth, with a cushion for bad years.' };
  return { safe: 20, balanced: 70, wild: 10, why: '7+ years: time to ride out the swings, so lean on the index fund.' };
}

/** Monthly amount that grows to `target` in `years` with a monthly SIP (annuity due). */
export function monthlyForTarget(target: number, annualRate: number, years: number): number {
  const n = Math.max(Math.round(years * 12), 1);
  const r = annualRate / 12;
  const factor = r === 0 ? n : ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return target / factor;
}

export interface GoalPlan {
  years: number;
  priceToday: number;
  priceAtGoal: number;
  inflation: number;
  rate: number;
  product: string;
  why: string;
  /** Monthly SIP needed (invested). */
  monthlyInvested: number;
  /** Monthly amount needed if kept as cash (no growth). */
  monthlyCash: number;
  /** Extra per month needed if you start 3 years later (0 if the goal is under 4 years away). */
  costOfWaiting: number;
}

export function makeGoalPlan(priceToday: number, age: number, targetAge: number, inflation = DEFAULT_INFLATION): GoalPlan {
  const years = Math.max(targetAge - age, 1);
  const priceAtGoal = inflatePrice(priceToday, inflation, years);
  const { rate, product, why } = planReturnFor(years);
  const monthlyInvested = monthlyForTarget(priceAtGoal, rate, years);
  const monthlyCash = priceAtGoal / (years * 12);
  const later = years - 3;
  const costOfWaiting = later >= 1 ? monthlyForTarget(priceAtGoal, planReturnFor(later).rate, later) - monthlyInvested : 0;
  return { years, priceToday, priceAtGoal, inflation, rate, product, why, monthlyInvested, monthlyCash, costOfWaiting };
}

/** Rounds a rupee amount to something friendly to read (₹520, ₹1,250, ₹12,500). */
export function friendlyRupees(v: number): number {
  if (v < 1000) return Math.round(v / 10) * 10;
  if (v < 10000) return Math.round(v / 50) * 50;
  return Math.round(v / 500) * 500;
}
