import { createSurf, makeCourse, stepSurf, SURF, surfAutopilot, surfResult } from '../chartSurfer';

const play = (seed: number) => {
  const s = createSurf(seed);
  let guard = 0;
  while (!s.over && guard++ < 20000) {
    surfAutopilot(s);
    stepSurf(s, 1 / 60);
  }
  return { s, r: surfResult(s) };
};

describe('Chart Surfer', () => {
  it('builds a course with six setups, gaps, coins and a moving average', () => {
    const c = makeCourse(5);
    expect(c.setups).toHaveLength(SURF.setups);
    expect(c.ma).toHaveLength(c.candles.length);
    expect(c.items.some((i) => i.kind === 'coin')).toBe(true);
    for (const s of c.setups) expect(s.at).toBeLessThan(c.candles.length - 6);
  });

  it('textbook patterns follow through only some of the time', () => {
    let held = 0;
    let total = 0;
    for (let seed = 1; seed <= 200; seed++)
      for (const s of makeCourse(seed).setups) {
        total++;
        if (s.actual === s.textbook) held++;
      }
    expect(held / total).toBeGreaterThan(0.5);
    expect(held / total).toBeLessThan(0.7);
  });

  it('the price really moves the way each setup played out', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const c = makeCourse(seed);
      for (const s of c.setups) {
        const move = c.candles[s.at + 6].c / c.candles[s.at].c - 1;
        expect(Math.sign(move)).toBe(s.actual === 'up' ? 1 : -1);
      }
    }
  });

  it('autopilot finishes, reads every setup the textbook way and earns coins', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const { s, r } = play(seed);
      expect(s.over).toBe(true);
      expect(r.reads).toHaveLength(SURF.setups);
      expect(r.readsRight).toBe(SURF.setups);
      expect(r.coins).toBeGreaterThan(30);
      expect(s.time).toBeLessThan(90);
    }
  });
});
