import { STATE_VERSION } from '../../state/migrations';
import { chooseOnSignIn, restoredState, snapshotOf } from '../sync';

jest.mock('../firebase', () => ({ firebaseDb: () => null }));

describe('progress backup', () => {
  it('a fresh phone restores the cloud copy; a phone with more progress uploads', () => {
    expect(chooseOnSignIn({ xp: 0, lessonsDone: 0 }, { xp: 640, lessonsDone: 12 })).toBe('restore');
    expect(chooseOnSignIn({ xp: 900, lessonsDone: 14 }, { xp: 640, lessonsDone: 12 })).toBe('upload');
    expect(chooseOnSignIn({ xp: 100, lessonsDone: 2 }, null)).toBe('upload');
    expect(chooseOnSignIn({ xp: 100, lessonsDone: 2 }, { xp: 100, lessonsDone: 2 })).toBe('upload');
  });

  it('round-trips saved fields without the account link', () => {
    const saved = { xp: 640, lessons: { 'w0-l1': {} }, coins: 186, account: { uid: 'u1' }, runs: { count: 3, bestScore: 142, dashDodged: 4 } };
    const snap = snapshotOf(saved);
    expect(snap).toMatchObject({ version: STATE_VERSION, xp: 640, lessonsDone: 1 });
    expect(snap.data).not.toContain('u1');
    const back = restoredState(snap);
    expect(back).toMatchObject({ xp: 640, coins: 186, runs: { count: 3, bestScore: 142, dashDodged: 4 } });
  });
});
