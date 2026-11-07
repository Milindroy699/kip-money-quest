/**
 * Ages and tracks. Explorer is 13–15; Builder is 16 and up, adults included. The stored band value
 * for Builder stays '16-19' (it's in saved progress), but it means "16 and older".
 * Under 18, a parent or guardian signs in for the player (see needsParent in src/account/prime.ts).
 */
import type { AgeBand } from '../state/game';

export const MIN_AGE = 13;
export const BUILDER_FROM = 16;
export const ADULT_AGE = 18;
export const MAX_AGE = 99;

export const TRACK_LABEL = { explorer: 'Explorer 13–15', builder: `Builder ${BUILDER_FROM}+` } as const;

export function bandForAge(age: number): AgeBand {
  return age >= BUILDER_FROM ? '16-19' : '13-15';
}

export function isAdult(age: number | null): boolean {
  return age !== null && age >= ADULT_AGE;
}

const GOAL_AGES = [18, 21, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];

/** Up to six "by what age?" choices, all at least two years away. */
export function goalAges(age: number): number[] {
  const options = GOAL_AGES.filter((a) => a >= age + 2).slice(0, 6);
  return options.length ? options : [age + 2, age + 5, age + 10];
}

/** Keep the current goal age if it's still ahead; otherwise the first choice at least three years out. */
export function defaultTargetAge(age: number, current: number): number {
  if (current >= age + 2) return current;
  const options = goalAges(age);
  return options.find((a) => a >= age + 3) ?? options[0];
}

/** A typed-in goal age: a whole number, at least a year away, and not past MAX_AGE. */
export function isValidTargetAge(age: number, target: number): boolean {
  return Number.isInteger(target) && target >= age + 1 && target <= MAX_AGE;
}
