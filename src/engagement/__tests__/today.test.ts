import { listOf, MAX_TODAY, todayNudges, type TodayContext } from '../today';

const base: TodayContext = { newSpots: [], mapTitle: 'Kip Campus', dividendReady: false, reviewsDue: 0, streakOpen: false, remindersOff: false, portfolioMove: null };
const arena = { id: 'arena', name: 'Duel Arena', emoji: '⚔️', activity: 'Market Duel', blurb: 'Take on Dash.' };

describe('For you today', () => {
  it('is empty when there is nothing to do', () => {
    expect(todayNudges(base)).toEqual([]);
  });

  it('puts new campus spots first, then rewards, then reviews', () => {
    const ids = todayNudges({ ...base, newSpots: [arena], dividendReady: true, reviewsDue: 2 }).map((n) => n.id);
    expect(ids).toEqual(['new-arena', 'dividend', 'reviews']);
  });

  it('shows at most three', () => {
    const all = todayNudges({ ...base, newSpots: [arena], dividendReady: true, reviewsDue: 1, streakOpen: true, remindersOff: true, portfolioMove: 0.02 });
    expect(all).toHaveLength(MAX_TODAY);
  });

  it('points new spots at the map', () => {
    expect(todayNudges({ ...base, newSpots: [arena] })[0]).toMatchObject({ title: 'New on Kip Campus: Duel Arena', action: { kind: 'campus', focus: 'arena' } });
  });

  it('folds several new spots into one nudge so other nudges still show', () => {
    const lab = { id: 'lab', name: 'Trading Lab', emoji: '📈', activity: 'Practice Portfolio', blurb: 'Invest your coins.' };
    const list = todayNudges({ ...base, newSpots: [arena, lab], reviewsDue: 1 });
    expect(list.map((n) => n.id)).toEqual(['new-spots', 'reviews']);
    expect(list[0]).toMatchObject({ title: '2 new spots on Kip Campus', text: 'Duel Arena (Market Duel) and Trading Lab (Practice Portfolio) just opened.', action: { kind: 'campus', focus: 'arena' } });
    expect(listOf(['A', 'B', 'C'])).toBe('A, B and C');
  });

  it('uses singular and plural for reviews', () => {
    expect(todayNudges({ ...base, reviewsDue: 1 })[0].title).toBe('1 review due');
    expect(todayNudges({ ...base, reviewsDue: 3 })[0].title).toBe('3 reviews due');
  });

  it('skips tiny portfolio moves and frames drops calmly', () => {
    expect(todayNudges({ ...base, portfolioMove: 0.0004 })).toEqual([]);
    const down = todayNudges({ ...base, portfolioMove: -0.021 })[0];
    expect(down.title).toBe('Practice Portfolio ▼ 2.1%');
    expect(down.text).toMatch(/stay the course/);
  });

  it('introduces Quiz Battle once, then suggests it on quiet days', () => {
    expect(todayNudges({ ...base, quizNew: true })[0]).toMatchObject({ id: 'quiz-new', action: { kind: 'route', href: '/quiz' } });
    expect(todayNudges({ ...base, quizSuggest: true }).map((n) => n.id)).toEqual(['quiz']);
    // Reviews come first; no quiz nudge while reviews are due.
    expect(todayNudges({ ...base, quizSuggest: true, reviewsDue: 2 }).map((n) => n.id)).toEqual(['reviews']);
  });
});

