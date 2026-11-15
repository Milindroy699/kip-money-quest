/** XP, coins, Dividend Day and FinIQ. All deterministic: no loot-box randomness. */
import { daysBetween, type DayKey } from './days';

// ---- XP ----------------------------------------------------------------------

export interface LessonOutcome {
  correct: number;
  total: number;
  boss?: boolean;
}

export function lessonXp(outcome: LessonOutcome, multiplier: number): number {
  const perfect = outcome.total > 0 && outcome.correct === outcome.total;
  const base = 20 + 5 * outcome.correct + (perfect ? 10 : 0) + (outcome.boss ? 20 : 0);
  return Math.round(base * multiplier);
}

/** XP for a rewarded run, based on the wallet coins it earned (so both modes are equal). */
export function runXp(walletCoins: number, multiplier: number): number {
  return Math.round((10 + walletCoins) * multiplier);
}

/** XP for a practice run (autopilot, or over the daily rewarded-run limit). */
export const PRACTICE_RUN_XP = 2;

export function reviewXp(correct: number, multiplier: number): number {
  return Math.round((5 + 3 * correct) * multiplier);
}

/** Quiz Battle: XP for every right answer; coins only for the first quiz each day, so it isn't a coin farm. */
export const QUIZ_FIRST_COINS = 5;
export function quizXp(correct: number, multiplier: number): number {
  return Math.round((3 + 2 * correct) * multiplier);
}

export function lessonCoins(outcome: LessonOutcome): number {
  return outcome.boss ? 40 : 20;
}

// ---- Economy balance (see docs/review-journeys.md) ----------------------------------
//
// A steady day (1 lesson + 1 run + 1 review) earns about 40–45 coins, so a 200-coin
// emergency-fund freeze costs about five days of steady play: it has to be built up.

/** Run score → wallet coins. Divisors equalise the modes per minute of play. */
export const RUN_COIN_DIVISOR = { inflation: 8, snowball: 24, risk: 4.5, timeframe: 5.5, chart: 5.5 } as const;
export const RUN_COIN_CAP = 20;
/** Runs per day that pay coins and full XP; later runs are practice. */
export const REWARDED_RUNS_PER_DAY = 3;

export function runWalletCoins(score: number, mode: keyof typeof RUN_COIN_DIVISOR): number {
  return Math.min(Math.max(Math.round(score / RUN_COIN_DIVISOR[mode]), 0), RUN_COIN_CAP);
}

/** Replays of finished lessons earn half XP, up to this much per day (stops league farming). */
export const REPLAY_XP_DAILY_CAP = 60;

export function replayLessonXp(fullXp: number, replayXpToday: number): number {
  return Math.max(0, Math.min(Math.round(fullXp / 2), REPLAY_XP_DAILY_CAP - replayXpToday));
}

// ---- Daily goal ------------------------------------------------------------------------

/** Rough minutes each activity takes, for the daily-goal ring. */
export const ACTIVITY_MINUTES = { lesson: 3, bossLesson: 4, run: 1, review: 1, duel: 2 } as const;

export function dailyGoalProgress(minutesToday: number, goalMinutes: number): number {
  return goalMinutes <= 0 ? 1 : Math.min(minutesToday / goalMinutes, 1);
}

// ---- Dividend Day --------------------------------------------------------------

/**
 * Comeback: after 3+ days away, the first lesson, review or run back pays a one-off welcome bonus.
 * The streak still resets (that's the SIP lesson); the bonus makes returning feel good, not guilty.
 */
export const COMEBACK_GAP_DAYS = 3;
export const COMEBACK_BONUS = 30;

export function comebackBonus(lastActiveDay: DayKey | null, today: DayKey): number {
  return lastActiveDay !== null && daysBetween(lastActiveDay, today) >= COMEBACK_GAP_DAYS ? COMEBACK_BONUS : 0;
}

/** Market Duel pays for taking part, more for winning; only the first few each day pay coins. */
export const DUEL_REWARD = { win: { xp: 25, coins: 15 }, draw: { xp: 15, coins: 8 }, lose: { xp: 10, coins: 5 } } as const;
export const REWARDED_DUELS_PER_DAY = 3;

export const DIVIDEND_INTERVAL_DAYS = 7;

export function canClaimDividend(lastClaimDay: DayKey | null, today: DayKey): boolean {
  return lastClaimDay === null || daysBetween(lastClaimDay, today) >= DIVIDEND_INTERVAL_DAYS;
}

export function daysUntilDividend(lastClaimDay: DayKey | null, today: DayKey): number {
  if (lastClaimDay === null) return 0;
  return Math.max(DIVIDEND_INTERVAL_DAYS - daysBetween(lastClaimDay, today), 0);
}

/** Payout scales with consistency (active days in the last 7) plus a streak bonus. */
export function dividendAmount(activeDaysInLast7: number, streak: number): number {
  return Math.round((20 * Math.min(activeDaysInLast7, 7)) / 7) + 2 * Math.min(streak, 30);
}

// ---- FinIQ ---------------------------------------------------------------------

export const FINIQ_MIN = 300;
export const FINIQ_MAX = 900;
export const ONBOARDING_FINIQ_BONUS = 20;
/** Total lesson weight across the full planned curriculum (Worlds 0–9). */
export const PLANNED_CURRICULUM_WEIGHT = 75;

export interface MasteryRecord {
  accuracy: number;
  boss?: boolean;
}

/** FinIQ rises with lessons completed, weighted by quiz accuracy. Bosses count double. */
export function computeFinIQ(onboarded: boolean, lessons: MasteryRecord[]): number {
  const earned = lessons.reduce((sum, l) => sum + (l.boss ? 2 : 1) * (0.5 + 0.5 * Math.min(Math.max(l.accuracy, 0), 1)), 0);
  const range = FINIQ_MAX - FINIQ_MIN - ONBOARDING_FINIQ_BONUS;
  const score = FINIQ_MIN + (onboarded ? ONBOARDING_FINIQ_BONUS : 0) + (range * earned) / PLANNED_CURRICULUM_WEIGHT;
  return Math.min(Math.round(score), FINIQ_MAX);
}

export interface FinIQBand {
  name: string;
  min: number;
  max: number;
  blurb: string;
}

export const FINIQ_BANDS: readonly FinIQBand[] = [
  { name: 'Starter', min: 300, max: 449, blurb: 'You know money is a tool and inflation is real.' },
  { name: 'Saver', min: 450, max: 599, blurb: 'You can explain compounding and why a SIP builds wealth.' },
  { name: 'Investor', min: 600, max: 749, blurb: 'You can match products to goals, risk and liquidity.' },
  { name: 'Compounder', min: 750, max: 900, blurb: 'You can build, hedge and analyse a portfolio for Future You.' },
];

export function finIQBand(score: number): FinIQBand {
  return FINIQ_BANDS.find((b) => score >= b.min && score <= b.max) ?? FINIQ_BANDS[0];
}

/** 0–1 progress toward the next band, for progress bars. */
export function finIQBandProgress(score: number): number {
  const band = finIQBand(score);
  return (score - band.min) / (band.max + 1 - band.min);
}
