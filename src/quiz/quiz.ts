/**
 * Quiz Battle: quick revision quizzes built from the quiz questions in lessons the player has finished.
 * Solo, or 1v1 on one phone (both players get the same questions, in the same order). Pure, so the
 * question picking and scoring are unit-tested.
 */
import { LESSONS } from '../content';
import { createRng } from '../sim/rng';

export const QUIZ_LENGTH = 8;
/** Points for a right answer, plus a small speed bonus (up to SPEED_BONUS, gone after 10 seconds). */
export const POINTS_RIGHT = 10;
export const SPEED_BONUS = 5;

export interface QuizOption {
  text: string;
  correct: boolean;
  why: string;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  question: string;
  options: QuizOption[];
}

/** Every quiz question from lessons the player has finished. */
export function quizPool(completed: Record<string, unknown>): QuizQuestion[] {
  return LESSONS.filter((l) => completed[l.id]).flatMap((l) =>
    l.steps.flatMap((step, i) => (step.type === 'quiz' ? [{ id: `${l.id}#${i}`, lessonId: l.id, question: step.question, options: step.options.map((o) => ({ text: o.text, correct: !!o.correct, why: o.why })) }] : [])),
  );
}

/** A quiz of up to `n` questions from the pool, shuffled by `seed` (answer order shuffled too). */
export function pickQuiz(pool: QuizQuestion[], seed: number, n = QUIZ_LENGTH): QuizQuestion[] {
  const rng = createRng(seed);
  const shuffle = <T,>(xs: T[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  return shuffle(pool)
    .slice(0, n)
    .map((q) => ({ ...q, options: shuffle(q.options) }));
}

/** Points for one answer: right answers score, faster ones a little more. */
export function pointsFor(correct: boolean, seconds: number): number {
  if (!correct) return 0;
  return POINTS_RIGHT + Math.max(0, Math.round(SPEED_BONUS * (1 - seconds / 10)));
}

export interface PlayerResult {
  name: string;
  points: number;
  correct: number;
  /** Ids of questions answered wrong, for the review at the end. */
  missed: string[];
}

/** 1v1: who won (by points, then right answers), or a draw. */
export function winnerOf(a: PlayerResult, b: PlayerResult): 'a' | 'b' | 'draw' {
  if (a.points !== b.points) return a.points > b.points ? 'a' : 'b';
  if (a.correct !== b.correct) return a.correct > b.correct ? 'a' : 'b';
  return 'draw';
}
