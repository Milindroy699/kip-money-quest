import { pathFor, WORLDS } from '../../content';
import { quizUnlocked } from '../../content/unlocks';
import { QUIZ_FIRST_COINS, quizXp } from '../../engagement/rewards';
import { pickQuiz, pointsFor, POINTS_RIGHT, QUIZ_LENGTH, quizPool, winnerOf } from '../quiz';

const upTo = (worldId: string) => Object.fromEntries(pathFor('builder').filter((l) => WORLDS.findIndex((w) => w.id === l.id.split('-')[0]) <= WORLDS.findIndex((w) => w.id === worldId)).map((l) => [l.id, true]));

describe('Quiz Battle', () => {
  it('opens once World 1 is finished', () => {
    expect(quizUnlocked({})).toBe(false);
    expect(quizUnlocked(upTo('w0'))).toBe(false);
    expect(quizUnlocked(upTo('w1'))).toBe(true);
  });

  it('only asks about finished lessons, and has a full quiz by the time it opens', () => {
    const pool = quizPool(upTo('w1'));
    expect(pool.length).toBeGreaterThanOrEqual(QUIZ_LENGTH);
    for (const q of pool) {
      expect(q.lessonId.startsWith('w0') || q.lessonId.startsWith('w1')).toBe(true);
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
    }
    expect(quizPool({})).toEqual([]);
  });

  it('gives both players the same quiz for the same seed, and a different one for another seed', () => {
    const pool = quizPool(upTo('w2'));
    const a = pickQuiz(pool, 42);
    expect(a).toHaveLength(QUIZ_LENGTH);
    expect(pickQuiz(pool, 42)).toEqual(a);
    expect(pickQuiz(pool, 43).map((q) => q.id)).not.toEqual(a.map((q) => q.id));
    expect(new Set(a.map((q) => q.id)).size).toBe(QUIZ_LENGTH);
    for (const q of a) expect(q.options.filter((o) => o.correct)).toHaveLength(1);
  });

  it('scores right answers with a small speed bonus', () => {
    expect(pointsFor(false, 1)).toBe(0);
    expect(pointsFor(true, 0)).toBe(POINTS_RIGHT + 5);
    expect(pointsFor(true, 30)).toBe(POINTS_RIGHT);
    expect(pointsFor(true, 2)).toBeGreaterThan(pointsFor(true, 8));
  });

  it('picks a winner by points, then right answers', () => {
    const p = (points: number, correct: number) => ({ name: 'x', points, correct, missed: [] });
    expect(winnerOf(p(80, 6), p(70, 7))).toBe('a');
    expect(winnerOf(p(70, 6), p(70, 7))).toBe('b');
    expect(winnerOf(p(70, 7), p(70, 7))).toBe('draw');
  });

  it('pays XP for right answers, and coins only for the first quiz of the day', () => {
    expect(quizXp(8, 1)).toBeGreaterThan(quizXp(2, 1));
    expect(QUIZ_FIRST_COINS).toBeGreaterThan(0);
  });
});
