import { trackFor } from '..';
import { bandForAge, defaultTargetAge, goalAges, isAdult, isValidTargetAge, TRACK_LABEL } from '../ages';

describe('ages and tracks', () => {
  it('puts 13–15 on Explorer and everyone 16 and up on Builder, adults included', () => {
    expect(trackFor(bandForAge(13))).toBe('explorer');
    expect(trackFor(bandForAge(15))).toBe('explorer');
    expect(trackFor(bandForAge(16))).toBe('builder');
    expect(trackFor(bandForAge(19))).toBe('builder');
    expect(trackFor(bandForAge(34))).toBe('builder');
    expect(TRACK_LABEL.builder).toBe('Builder 16+');
  });

  it('knows who is an adult', () => {
    expect(isAdult(17)).toBe(false);
    expect(isAdult(18)).toBe(true);
    expect(isAdult(null)).toBe(false);
  });

  it('offers goal ages that are ahead of you, at any age', () => {
    expect(goalAges(15)).toEqual([18, 21, 25, 30, 35, 40]);
    expect(goalAges(30)).toEqual([35, 40, 45, 50, 55, 60]);
    expect(goalAges(30).every((a) => a >= 32)).toBe(true);
    expect(goalAges(85)).toEqual([87, 90, 95]);
  });

  it('keeps a goal age still ahead, and moves one that has passed', () => {
    expect(defaultTargetAge(15, 25)).toBe(25);
    expect(defaultTargetAge(30, 25)).toBe(35);
    expect(defaultTargetAge(24, 25)).toBe(30);
  });

  it('accepts a typed-in goal age only if it is ahead and sensible', () => {
    expect(isValidTargetAge(15, 22)).toBe(true);
    expect(isValidTargetAge(15, 16)).toBe(true);
    expect(isValidTargetAge(15, 15)).toBe(false);
    expect(isValidTargetAge(30, 28)).toBe(false);
    expect(isValidTargetAge(30, 100)).toBe(false);
    expect(isValidTargetAge(30, 33.5)).toBe(false);
  });
});
