/**
 * When to offer "Save your progress" (sign-in): only once the player is primed, i.e. they've hit
 * the activation milestone (3 lessons and a run) and have something worth keeping. It's offered
 * at a high point (right after a lesson's rewards), never blocks play, and backs off: after
 * "Not now" it waits for more lessons and days, and stops after a few tries (it's always in You).
 */
import { daysBetween, type DayKey } from '../engagement/days';

export const SAVE_PROMPT = {
  /** Activation milestone (docs/metrics.md): 3 lessons and 1 run. */
  minLessons: 3,
  minRuns: 1,
  /** After this many offers, only the You tab offers it. */
  maxOffers: 3,
  lessonsBetween: 4,
  daysBetween: 3,
};

export interface SavePromptState {
  offers: number;
  lastDay: DayKey | null;
  lessonsAtLast: number;
}

export const emptySavePrompt: SavePromptState = { offers: 0, lastDay: null, lessonsAtLast: 0 };

export function shouldOfferSave(i: { offered: boolean; signedIn: boolean; lessonsDone: number; runs: number; today: DayKey; prompt: SavePromptState }): boolean {
  if (!i.offered || i.signedIn) return false;
  if (i.lessonsDone < SAVE_PROMPT.minLessons || i.runs < SAVE_PROMPT.minRuns) return false;
  const p = i.prompt;
  if (p.offers >= SAVE_PROMPT.maxOffers) return false;
  if (p.offers === 0 || p.lastDay === null) return true;
  return i.lessonsDone - p.lessonsAtLast >= SAVE_PROMPT.lessonsBetween && daysBetween(p.lastDay, i.today) >= SAVE_PROMPT.daysBetween;
}

/** Under 18, a parent or guardian has to consent (India's DPDP Act), so they sign in for the family. */
export function needsParent(age: number | null): boolean {
  return age === null || age < 18;
}
