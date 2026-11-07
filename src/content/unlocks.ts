/**
 * When each game outside the lessons opens. One place for the rules, so the run picker,
 * the league tab and the campus map always agree.
 */
import { isLessonUnlocked, WORLDS } from './index';

export type RunModeId = 'inflation' | 'snowball' | 'risk' | 'timeframe' | 'chart';

/** Kip Run modes: each opens at the lesson that teaches it. */
export function runModeUnlocked(mode: RunModeId, completed: Record<string, unknown>): boolean {
  switch (mode) {
    case 'inflation':
      return true;
    case 'snowball':
      return isLessonUnlocked('w2-l3', completed);
    case 'risk':
      return isLessonUnlocked('w3-l2', completed);
    case 'timeframe':
      return !!completed['w7-l3'];
    case 'chart':
      return !!completed['w8-l3'];
  }
}

export const RUN_MODE_UNLOCK_TEXT: Record<RunModeId, string> = {
  inflation: '',
  snowball: 'Unlocks in Snowball Valley, lesson 3.',
  risk: 'Unlocks in Risk Ridge, lesson 2.',
  timeframe: 'Builder track: unlocks in Time Tracks, lesson 3.',
  chart: 'Builder track: unlocks in Analyst HQ, lesson 3.',
};

/** Market Duel opens once the player reaches Risk Ridge, lesson 3 (they know risk and lock-ins by then). */
export function duelUnlocked(completed: Record<string, unknown>): boolean {
  return isLessonUnlocked('w3-l3', completed);
}

/** Quiz Battle opens once World 1 (The Melt) is finished: by then there's enough to quiz on. */
export const QUIZ_UNLOCK_WORLD = 'w1';
export function quizUnlocked(completed: Record<string, unknown>): boolean {
  return WORLDS.find((w) => w.id === QUIZ_UNLOCK_WORLD)!.lessons.every((l) => completed[l.id]);
}
export const QUIZ_UNLOCK_TEXT = 'Opens when you finish The Melt (World 1).';

