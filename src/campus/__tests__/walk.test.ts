import { walkPath } from '../map';
import { facingAt, facingFor, facingSchedule, facingTimes, walkEase, walkEaseInverse } from '../walk';

describe("Kip's facing on the map", () => {
  it('picks the view from the step direction (y grows downwards)', () => {
    expect(facingFor(0.1, -0.2)).toEqual({ view: 'up', mirror: false });
    expect(facingFor(-0.1, -0.2)).toEqual({ view: 'up', mirror: true });
    expect(facingFor(0.05, 0.2)).toEqual({ view: 'down', mirror: false });
    expect(facingFor(-0.3, 0.05)).toEqual({ view: 'side', mirror: true });
    expect(facingFor(0.3, -0.05)).toEqual({ view: 'side', mirror: false });
  });

  it('walking up the road from the gate faces up, and back down faces down', () => {
    const up = walkPath('gate', 'w3');
    const sUp = facingSchedule(up);
    expect(sUp[0].at).toBe(0);
    expect(sUp.some((s) => s.facing.view === 'up')).toBe(true);
    expect(sUp.some((s) => s.facing.view === 'down')).toBe(false);
    const sDown = facingSchedule([...up].reverse());
    expect(sDown.some((s) => s.facing.view === 'down')).toBe(true);
    expect(sDown.some((s) => s.facing.view === 'up')).toBe(false);
  });

  it('only lists changes, in order, and looks them up by progress', () => {
    const s = facingSchedule(walkPath('gate', 'w9'));
    for (let i = 1; i < s.length; i++) {
      expect(s[i].at).toBeGreaterThan(s[i - 1].at);
      expect(s[i].facing).not.toEqual(s[i - 1].facing);
    }
    expect(facingAt(s, 0)).toEqual(s[0].facing);
    expect(facingAt(s, 1)).toEqual(s[s.length - 1].facing);
    expect(facingSchedule([{ x: 0, y: 0 }])).toEqual([]);
  });

  it('times the turns along the eased walk', () => {
    for (const t of [0, 0.1, 0.3, 0.5, 0.7, 0.95, 1]) expect(walkEaseInverse(walkEase(t))).toBeCloseTo(t, 6);
    const s = facingSchedule(walkPath('gate', 'w9'));
    const times = facingTimes(s, 2000);
    expect(times[0].ms).toBe(0);
    for (let i = 1; i < times.length; i++) expect(times[i].ms).toBeGreaterThanOrEqual(times[i - 1].ms);
    expect(times[times.length - 1].ms).toBeLessThanOrEqual(2000);
  });
});
