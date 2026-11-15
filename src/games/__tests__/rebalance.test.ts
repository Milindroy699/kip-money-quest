import { buy, driftTwin, grow, onTarget, rebalanced, rebalancerPath, RUSH, sell, settleCash, startMix, total, TARGET, weight, worstDrop, yearsFor } from '../rebalance';

describe('Rebalance Rush', () => {
  it('every game has six years with a boom before a crash', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const ids = yearsFor(seed).map((y) => y.id);
      expect(ids).toHaveLength(RUSH.rounds);
      expect(ids.indexOf('boom')).toBeGreaterThanOrEqual(0);
      expect(ids.indexOf('crash')).toBeGreaterThan(ids.indexOf('boom'));
    }
  });

  it('a boom pushes the mix off target, and sell/buy steps can bring it back', () => {
    let m = grow(startMix(), yearsFor(3).find((y) => y.id === 'boom')!);
    expect(onTarget(m)).toBe(false);
    expect(weight(m, 'shares')).toBeGreaterThan(TARGET.shares + RUSH.tolerance);
    const before = total(m);
    m = sell(m, 'shares');
    m = buy(m, 'bonds');
    expect(total(m)).toBeCloseTo(before, 6);
    expect(onTarget(m)).toBe(true);
  });

  it('time-out puts leftover cash back without losing any', () => {
    const m = settleCash(sell(startMix(), 'shares'));
    expect(m.cash).toBe(0);
    expect(total(m)).toBeCloseTo(RUSH.start, 6);
  });

  it('rebalancing keeps the chosen risk: smaller worst drops than the drift twin, on average', () => {
    let calmer = 0;
    let drifted = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const years = yearsFor(seed);
      const twin = driftTwin(years);
      if (worstDrop(rebalancerPath(years)) <= worstDrop(twin.values) + 1e-9) calmer++;
      if (twin.peakShares > TARGET.shares + RUSH.tolerance) drifted++;
    }
    expect(calmer / 200).toBeGreaterThan(0.6);
    expect(drifted / 200).toBeGreaterThan(0.8);
    expect(onTarget(rebalanced(grow(startMix(), yearsFor(1)[0])))).toBe(true);
  });
});
