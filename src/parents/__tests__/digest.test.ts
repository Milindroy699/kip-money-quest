import { weeklyDigest } from '../digest';

describe('weekly parent digest', () => {
  const base = {
    name: 'Nova',
    today: '2026-11-08',
    lessons: { 'w0-l1': { completedDay: '2026-10-20' }, 'w3-l1': { completedDay: '2026-11-03' }, 'w3-l2': { completedDay: '2026-11-07' } },
    streak: { count: 6, activeDays: ['2026-10-30', '2026-11-03', '2026-11-04', '2026-11-07', '2026-11-08'] },
    finiq: 455,
    portfolio: { value: 112, principal: 100 },
  };

  it('counts only this week’s lessons and active days', () => {
    const d = weeklyDigest(base);
    expect(d.learned.map((l) => l.title)).toEqual(['What risk really means', 'The risk–return ladder']);
    expect(d.activeDays).toBe(4);
    expect(d.totalLessons).toBe(3);
  });

  it('asks about what was learned, and says it’s education only', () => {
    const d = weeklyDigest(base);
    expect(d.questions[0]).toMatch(/dip and a permanent loss/);
    expect(d.text).toContain('Nova');
    expect(d.text).toContain('Education only');
    expect(d.text).toContain('not real money');
  });

  it('a quiet week still reads kindly', () => {
    const d = weeklyDigest({ ...base, lessons: {}, portfolio: null });
    expect(d.text).toMatch(/good week to restart/);
  });
});
