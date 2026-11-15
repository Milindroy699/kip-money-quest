import { emptySavePrompt, needsParent, SAVE_PROMPT, shouldOfferSave } from '../prime';

const base = { offered: true, signedIn: false, lessonsDone: 3, runs: 1, today: '2026-11-10', prompt: emptySavePrompt };

describe('save-progress prompt', () => {
  it('waits until the player is primed: 3 lessons and a run', () => {
    expect(shouldOfferSave({ ...base, lessonsDone: 2 })).toBe(false);
    expect(shouldOfferSave({ ...base, runs: 0 })).toBe(false);
    expect(shouldOfferSave(base)).toBe(true);
  });

  it('never shows when signed in or when sign-in is not offered', () => {
    expect(shouldOfferSave({ ...base, signedIn: true })).toBe(false);
    expect(shouldOfferSave({ ...base, offered: false })).toBe(false);
  });

  it('backs off after "Not now": more lessons and days, then stops', () => {
    const after = { offers: 1, lastDay: '2026-11-10', lessonsAtLast: 3 };
    expect(shouldOfferSave({ ...base, lessonsDone: 7, today: '2026-11-11', prompt: after })).toBe(false); // too soon
    expect(shouldOfferSave({ ...base, lessonsDone: 5, today: '2026-11-20', prompt: after })).toBe(false); // too few lessons
    expect(shouldOfferSave({ ...base, lessonsDone: 7, today: '2026-11-13', prompt: after })).toBe(true);
    expect(shouldOfferSave({ ...base, lessonsDone: 30, today: '2027-01-01', prompt: { ...after, offers: SAVE_PROMPT.maxOffers } })).toBe(false);
  });

  it('asks a parent for anyone under 18', () => {
    expect(needsParent(13)).toBe(true);
    expect(needsParent(17)).toBe(true);
    expect(needsParent(18)).toBe(false);
    expect(needsParent(null)).toBe(true);
  });
});
