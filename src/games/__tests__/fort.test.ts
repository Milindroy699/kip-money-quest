import { emptyFort, playFort, resolveWave, waveList, type Fort } from '../fort';

const fort = (p: Partial<Fort>): Fort => ({ ...emptyFort(), ...p });
const balanced = fort({ shares: 2, bonds: 1, gold: 1, cash: 1 });
const allShares = fort({ shares: 5 });
const allCash = fort({ cash: 5 });

function stats(f: Fort) {
  let survived = 0;
  let score = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const r = playFort(f, waveList(seed, 5));
    if (!r.fell) survived++;
    score += r.score;
  }
  return { survival: survived / 300, score: score / 300 };
}

describe('Fort Defense', () => {
  it('a mixed fort survives almost always and outscores the extremes', () => {
    const b = stats(balanced);
    const s = stats(allShares);
    const c = stats(allCash);
    expect(b.survival).toBeGreaterThan(0.95);
    expect(s.survival).toBeLessThan(0.75);
    expect(b.score).toBeGreaterThan(s.score);
    expect(b.score).toBeGreaterThan(c.score);
  });

  it('a hedge halves crash damage, cash stops surprise bills, gold beats inflation', () => {
    expect(resolveWave(fort({ shares: 4, hedge: 1 }), 'crash').damage).toBe(resolveWave(fort({ shares: 4, bonds: 1 }), 'crash').damage / 2);
    expect(resolveWave(fort({ shares: 5 }), 'bills').damage).toBe(25);
    expect(resolveWave(fort({ shares: 4, cash: 1 }), 'bills').damage).toBe(0);
    expect(resolveWave(fort({ cash: 2, gold: 3 }), 'inflation').damage).toBe(0);
  });

  it('waves are the same for the same seed', () => {
    expect(waveList(9, 7)).toEqual(waveList(9, 7));
  });
});
