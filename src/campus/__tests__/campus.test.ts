import { pathFor, WORLDS } from '../../content';
import { runModeUnlocked } from '../../content/unlocks';
import { doorOf, kipHome, newSpots, PLACES, placeById, ROAD_STOPS, roadSamples, SAMPLES_PER_SEGMENT, spotState, spurFor, walkPath, worldStatus, MAP_HEIGHT, type SpotContext } from '../map';
import { SKINS, skinFor } from '../skins';

/** Every lesson on the track up to and including `id`, marked complete. */
const upTo = (id: string, track: 'explorer' | 'builder' = 'builder') => {
  const path = pathFor(track);
  return Object.fromEntries(path.slice(0, path.findIndex((l) => l.id === id) + 1).map((l) => [l.id, true]));
};

const ctx = (completed: Record<string, unknown>, extra: Partial<SpotContext> = {}): SpotContext => ({
  completed,
  reviewsDue: 0,
  dividendReady: false,
  dividendClaimedBefore: false,
  portfolioStarted: false,
  ...extra,
});

describe('campus layout', () => {
  it('fits every place on the map, without overlaps', () => {
    for (const p of PLACES) {
      expect(p.x - p.size / 2).toBeGreaterThanOrEqual(0);
      expect(p.x + p.size / 2).toBeLessThanOrEqual(1);
      expect(p.y - p.size / 2).toBeGreaterThanOrEqual(0);
      expect(doorOf(p).y).toBeLessThanOrEqual(MAP_HEIGHT);
    }
    for (const a of PLACES)
      for (const b of PLACES) {
        if (a === b) continue;
        const gap = Math.hypot(a.x - b.x, a.y - b.y);
        expect(gap).toBeGreaterThan((a.size + b.size) / 2 - 0.02);
      }
  });

  it('has a building for every world after Money Town, and a name for each in both looks', () => {
    for (const w of WORLDS.filter((x) => x.id !== 'w0')) {
      expect(placeById(w.id)?.kind).toBe('world');
      expect(SKINS.campus.places[w.id]).toBeDefined();
      expect(SKINS.island.places[w.id]).toBeDefined();
    }
  });

  it('runs the road from the gate up to World 9, through every stop', () => {
    const s = roadSamples();
    expect(s.length).toBe((ROAD_STOPS.length - 1) * SAMPLES_PER_SEGMENT + 1);
    ROAD_STOPS.forEach((id, i) => {
      const door = doorOf(placeById(id)!);
      expect(s[i * SAMPLES_PER_SEGMENT].x).toBeCloseTo(door.x, 6);
      expect(s[i * SAMPLES_PER_SEGMENT].y).toBeCloseTo(door.y, 6);
    });
  });

  it('walks Kip along the road in either direction', () => {
    const up = walkPath('w1', 'w3');
    const down = walkPath('w3', 'w1');
    expect(up.length).toBe(2 * SAMPLES_PER_SEGMENT + 1);
    expect(down).toEqual([...up].reverse());
    expect(up[0]).toEqual(roadSamples()[SAMPLES_PER_SEGMENT]);
    expect(walkPath('w1', 'library')).toEqual([]);
  });

  it('joins each spot to the road with a short path', () => {
    for (const p of PLACES.filter((x) => x.kind === 'spot')) {
      const { from, to } = spurFor(p);
      expect(Math.hypot(from.x - to.x, from.y - to.y)).toBeLessThan(0.45);
    }
  });
});

describe('progress on the map', () => {
  it('starts Kip at the gate while Money Town is unfinished', () => {
    expect(kipHome({}, 'builder')).toBe('gate');
    expect(kipHome(upTo('w0-l4'), 'builder')).toBe('w1');
    expect(kipHome(upTo('w2-l2'), 'builder')).toBe('w2');
  });

  it('marks worlds done, current and locked', () => {
    const done = upTo('w1-l5');
    expect(worldStatus('w1', done, 'builder')).toBe('done');
    expect(worldStatus('w2', done, 'builder')).toBe('current');
    expect(worldStatus('w3', done, 'builder')).toBe('locked');
  });

  it('shows Builder-only worlds to Explorers as Builder-only, and skips them on the path', () => {
    expect(worldStatus('w7', {}, 'explorer')).toBe('builderOnly');
    expect(worldStatus('w7', {}, 'builder')).toBe('locked');
    const explorerDone = upTo('w5-l5', 'explorer');
    expect(kipHome(explorerDone, 'explorer')).toBe('w9');
    expect(worldStatus('w9', explorerDone, 'explorer')).toBe('current');
  });

  it('waits at World 9 once everything is done', () => {
    const all = Object.fromEntries(pathFor('builder').map((l) => [l.id, true]));
    expect(kipHome(all, 'builder')).toBe('w9');
    expect(worldStatus('w9', all, 'builder')).toBe('done');
  });
});

describe('campus spots open as you learn', () => {
  it('keeps the running track open from day one', () => {
    expect(spotState('track', ctx({})).unlocked).toBe(true);
  });

  it('opens the library after the first lesson, with a badge for reviews due', () => {
    expect(spotState('library', ctx({})).unlocked).toBe(false);
    expect(spotState('library', ctx(upTo('w0-l1'), { reviewsDue: 2 }))).toMatchObject({ unlocked: true, badge: '2' });
  });

  it('opens the bank after Money Town, or for anyone who has claimed before', () => {
    expect(spotState('bank', ctx(upTo('w0-l3'))).unlocked).toBe(false);
    expect(spotState('bank', ctx(upTo('w0-l4'), { dividendReady: true }))).toMatchObject({ unlocked: true, badge: 'Ready' });
    expect(spotState('bank', ctx({}, { dividendClaimedBefore: true })).unlocked).toBe(true);
  });

  it('opens the trading lab after the Fixed Deposit lesson, or for an existing portfolio', () => {
    expect(spotState('lab', ctx(upTo('w1-l3'))).unlocked).toBe(false);
    expect(spotState('lab', ctx(upTo('w1-l4'))).unlocked).toBe(true);
    expect(spotState('lab', ctx({}, { portfolioStarted: true })).unlocked).toBe(true);
  });

  it('opens the duel arena at Risk Ridge lesson 3, the same rule as the League tab', () => {
    expect(spotState('arena', ctx(upTo('w3-l1'))).unlocked).toBe(false);
    expect(spotState('arena', ctx(upTo('w3-l2'))).unlocked).toBe(true);
  });

  it('lists newly opened spots until they are visited', () => {
    const c = ctx(upTo('w1-l4'));
    expect(newSpots(c, [])).toEqual(['library', 'bank', 'lab']);
    expect(newSpots(c, ['library', 'lab'])).toEqual(['bank']);
  });

  it('opens run modes at the lessons that teach them', () => {
    expect(runModeUnlocked('inflation', {})).toBe(true);
    expect(runModeUnlocked('snowball', upTo('w2-l1'))).toBe(false);
    expect(runModeUnlocked('snowball', upTo('w2-l2'))).toBe(true);
    expect(runModeUnlocked('chart', upTo('w8-l2'))).toBe(false);
    expect(runModeUnlocked('chart', upTo('w8-l3'))).toBe(true);
  });
});

describe('map looks', () => {
  it('gives Builders the campus and Explorers the island', () => {
    expect(skinFor('builder').id).toBe('campus');
    expect(skinFor('explorer').id).toBe('island');
  });
});
