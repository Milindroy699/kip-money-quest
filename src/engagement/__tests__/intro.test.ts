import { introLines, type IntroContext } from '../intro';

const base: IntroContext = { name: 'Aarav Mehta', onboarded: true, streak: 0, doneToday: false, goal: null, hour: 9, day: 0 };

describe('Kip’s opening hello', () => {
  it('says hi by first name, or just hi', () => {
    expect(introLines(base).hi).toBe('Hii Aarav! 👋');
    expect(introLines({ ...base, name: '  ' }).hi).toBe('Hii! 👋');
  });

  it('introduces himself to a new player', () => {
    expect(introLines({ ...base, onboarded: false }).line).toMatch(/I’m Kip/);
  });

  it('cheers a streak, nods to the goal, and rotates by day', () => {
    const ctx = { ...base, streak: 4, goal: '💻 Laptop by 25' };
    const seen = new Set([0, 1, 2].map((day) => introLines({ ...ctx, day }).line));
    expect(seen.size).toBe(3);
    expect([...seen].some((l) => l.includes('Day 5'))).toBe(true);
    expect([...seen].some((l) => l.includes('Laptop by 25'))).toBe(true);
  });

  it('greets by time of day when nothing else applies', () => {
    expect(introLines(base).line).toMatch(/Morning/);
    expect(introLines({ ...base, hour: 20 }).line).toMatch(/Evening/);
  });
});
