import { handleFor } from '../handle';
import { newDuelCode, normaliseCode } from '../duels';
import { nextTier, rankIn, TIERS } from '../leagues';

jest.mock('../../account/firebase', () => ({ firebaseDb: () => null }));

describe('leagues', () => {
  it('top 7 move up, bottom 5 move down, and no-shows stay', () => {
    expect(nextTier(0, 1, 30, 500)).toBe(1);
    expect(nextTier(0, 7, 30, 100)).toBe(1);
    expect(nextTier(2, 8, 30, 100)).toBe(2);
    expect(nextTier(2, 26, 30, 40)).toBe(1);
    expect(nextTier(0, 30, 30, 10)).toBe(0); // can't go below the first tier
    expect(nextTier(TIERS.length - 1, 1, 30, 999)).toBe(TIERS.length - 1);
    expect(nextTier(3, 1, 30, 0)).toBe(3);
    expect(nextTier(3, 9, 9, 50)).toBe(3); // too few players to demote
  });

  it('finds your rank in a league', () => {
    const s = [{ uid: 'a', handle: 'A', xp: 90 }, { uid: 'b', handle: 'B', xp: 50 }];
    expect(rankIn(s, 'b')).toEqual({ rank: 2, count: 2, xp: 50 });
    expect(rankIn(s, 'z')).toBeNull();
  });
});

describe('handles and duel codes', () => {
  it('handles are stable pseudonyms, never empty', () => {
    expect(handleFor('uid-123')).toBe(handleFor('uid-123'));
    expect(handleFor('uid-123')).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+ \d{2}$/);
  });

  it('duel codes are 6 easy-to-read characters', () => {
    const code = newDuelCode();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(normaliseCode(' kq7-x2m p ')).toBe('KQ7X2M');
  });
});
