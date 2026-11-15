import { BRIEFS, CHIPS, dashChips, playDuel, setupDuel, type Chips } from '../engine';

const balanced: Chips = { indexFund: 2, fd: 1, govBond: 1, gold: 1 };

describe('Market Duel', () => {
  it('a seed fixes the brief, the market years and every return, for both players', () => {
    expect(setupDuel(42)).toEqual(setupDuel(42));
    const s = setupDuel(42);
    expect(s.events).toHaveLength(s.brief.years);
    expect(playDuel(s, balanced)).toEqual(playDuel(s, balanced));
  });

  it('needs exactly five chips', () => {
    expect(() => playDuel(setupDuel(1), { fd: 4 })).toThrow();
    expect(CHIPS).toBe(5);
  });

  it('a spread-out portfolio usually beats Dash’s all-in bets', () => {
    let wins = 0;
    let mine = 0;
    let his = 0;
    const n = 300;
    for (let seed = 1; seed <= n; seed++) {
      const s = setupDuel(seed);
      const a = playDuel(s, balanced).score.total;
      const b = playDuel(s, dashChips(seed)).score.total;
      if (a > b) wins++;
      mine += a;
      his += b;
    }
    expect(wins / n).toBeGreaterThan(0.6);
    expect(mine / n).toBeGreaterThan(his / n + 10);
  });

  it('the cash-need brief punishes having nothing you can get to quickly', () => {
    let seed = 1;
    while (!setupDuel(seed).brief.cashNeedYear) seed++;
    const s = setupDuel(seed);
    expect(playDuel(s, { fd: 3, govBond: 2 }).run.liquidityMet).toBe(false);
    expect(playDuel(s, { fd: 3, savings: 2 }).run.liquidityMet).toBe(true);
  });

  it('every brief is reachable without wild bets', () => {
    for (const b of BRIEFS) expect(b.goal / b.start).toBeLessThan(Math.pow(1.12 / 1.06, b.years) * 1.05);
  });
});
