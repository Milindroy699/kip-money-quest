import { ACHIEVEMENTS, achievementStatuses, nextTrophy, SHELVES, type AchievementInput } from '../achievements';

const fresh: AchievementInput = { lessons: {}, worldsDone: [], longestStreak: 0, runs: 0, cards: 2, totalCards: 24, finiq: 320, dividendClaimed: false, invested: false, duelsWon: 0, quizzesPlayed: 0, quizPerfect: 0 };

describe('Trophy Room', () => {
  it('has unique ids, and every trophy sits on a known shelf', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    for (const a of ACHIEVEMENTS) expect(SHELVES.map((s) => s.id)).toContain(a.shelf);
  });

  it('a new player has earned nothing, and progress is capped at the target', () => {
    const s = achievementStatuses(fresh);
    expect(s.filter((x) => x.earned)).toEqual([]);
    expect(s.find((x) => x.achievement.id === 'finiq-saver')!.value).toBe(320);
    const big = achievementStatuses({ ...fresh, runs: 400 });
    expect(big.find((x) => x.achievement.id === 'run-25')).toMatchObject({ earned: true, value: 25 });
  });

  it('earns from real progress', () => {
    const s = achievementStatuses({
      ...fresh,
      lessons: { 'w0-l1': { accuracy: 1, boss: false }, 'w0-l5': { accuracy: 0.8, boss: true } },
      worldsDone: ['w0'],
      longestStreak: 7,
      runs: 1,
      dividendClaimed: true,
      duelsWon: 1,
    });
    const earned = s.filter((x) => x.earned).map((x) => x.achievement.id);
    expect(earned).toEqual(expect.arrayContaining(['first-lesson', 'money-town', 'streak-3', 'streak-7', 'boss', 'run-1', 'dividend', 'duel-1']));
    expect(earned).not.toContain('streak-30');
    expect(earned).not.toContain('perfect-5');
  });

  it('Full Deck needs every card', () => {
    const almost = achievementStatuses({ ...fresh, cards: 23 }).find((x) => x.achievement.id === 'cards-all')!;
    expect(almost.earned).toBe(false);
    expect(achievementStatuses({ ...fresh, cards: 24 }).find((x) => x.achievement.id === 'cards-all')!.earned).toBe(true);
  });

  it('points at the closest unearned trophy', () => {
    const s = achievementStatuses({ ...fresh, longestStreak: 2 });
    expect(nextTrophy(s)?.achievement.id).toBe('streak-3');
  });
});
