/**
 * The Knowledge SIP: a daily streak that models a SIP.
 * - Each active day is a deposit.
 * - The XP multiplier compounds at 1% per day (capped).
 * - Missing a day is a "withdrawal" that resets the streak, unless an emergency-fund
 *   freeze covers the gap.
 */
import { addDays, daysBetween, type DayKey } from './days';

export interface StreakState {
  count: number;
  longest: number;
  lastActiveDay: DayKey | null;
  /** Emergency-fund freezes held. */
  freezes: number;
  /** Recent active days (most recent last), capped to 60 entries. */
  activeDays: DayKey[];
}

export const MAX_FREEZES = 2;
/** About five days of steady play (see the economy note in rewards.ts). */
export const FREEZE_COST = 200;
export const MULTIPLIER_CAP = 1.5;
const HISTORY_LIMIT = 60;

export const initialStreak: StreakState = { count: 0, longest: 0, lastActiveDay: null, freezes: 0, activeDays: [] };

export type StreakEvent = 'started' | 'continued' | 'same-day' | 'protected' | 'reset';

export interface StreakUpdate {
  state: StreakState;
  event: StreakEvent;
  freezesUsed: number;
}

/** Records activity on `today`. Idempotent within a day. */
export function recordActivity(state: StreakState, today: DayKey): StreakUpdate {
  const history = (days: DayKey[]) => [...days, today].slice(-HISTORY_LIMIT);

  if (state.lastActiveDay === null) {
    const count = 1;
    return { state: { ...state, count, longest: Math.max(state.longest, count), lastActiveDay: today, activeDays: history(state.activeDays) }, event: 'started', freezesUsed: 0 };
  }

  const gap = daysBetween(state.lastActiveDay, today);
  if (gap <= 0) return { state, event: 'same-day', freezesUsed: 0 };

  if (gap === 1) {
    const count = state.count + 1;
    return { state: { ...state, count, longest: Math.max(state.longest, count), lastActiveDay: today, activeDays: history(state.activeDays) }, event: 'continued', freezesUsed: 0 };
  }

  const missed = gap - 1;
  if (missed <= state.freezes) {
    const count = state.count + 1;
    return {
      state: { ...state, count, longest: Math.max(state.longest, count), lastActiveDay: today, freezes: state.freezes - missed, activeDays: history(state.activeDays) },
      event: 'protected',
      freezesUsed: missed,
    };
  }

  return { state: { ...state, count: 1, lastActiveDay: today, activeDays: history(state.activeDays) }, event: 'reset', freezesUsed: 0 };
}

export type StreakStatus = 'none' | 'done-today' | 'at-risk' | 'protected' | 'broken';

/** What the streak looks like on `today` before any activity. */
export function streakStatus(state: StreakState, today: DayKey): StreakStatus {
  if (state.lastActiveDay === null) return 'none';
  const gap = daysBetween(state.lastActiveDay, today);
  if (gap <= 0) return 'done-today';
  if (gap === 1) return 'at-risk';
  return gap - 1 <= state.freezes ? 'protected' : 'broken';
}

/** The streak number to show on `today` (0 once broken). */
export function displayStreak(state: StreakState, today: DayKey): number {
  return streakStatus(state, today) === 'broken' ? 0 : state.count;
}

/** XP multiplier: compounds at 1% per streak day, capped at 1.5×. */
export function streakMultiplier(count: number): number {
  return Math.min(Math.pow(1.01, Math.max(count - 1, 0)), MULTIPLIER_CAP);
}

/** Kip's shell gains a growth ring for each full streak week. */
export function shellRings(count: number): number {
  return Math.floor(count / 7);
}

/** Days active in the 7 days ending on `today` (inclusive). */
export function activeInLast7(state: StreakState, today: DayKey): number {
  const window = new Set(Array.from({ length: 7 }, (_, i) => addDays(today, -i)));
  return new Set(state.activeDays.filter((d) => window.has(d))).size;
}

export type FreezePurchase = { ok: true; state: StreakState; coins: number } | { ok: false; reason: 'max-held' | 'not-enough-coins' };

/** Buy one emergency-fund freeze with coins. */
export function buyFreeze(state: StreakState, coins: number): FreezePurchase {
  if (state.freezes >= MAX_FREEZES) return { ok: false, reason: 'max-held' };
  if (coins < FREEZE_COST) return { ok: false, reason: 'not-enough-coins' };
  return { ok: true, state: { ...state, freezes: state.freezes + 1 }, coins: coins - FREEZE_COST };
}
