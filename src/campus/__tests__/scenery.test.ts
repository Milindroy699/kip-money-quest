import { DECO_KINDS } from '../art';
import { placeBox } from '../layout';
import { MAP_HEIGHT, PLACES, roadSamples } from '../map';
import { AMBIENT, ambientBox, scatterScenery } from '../scenery';
import type { SkinId } from '../skins';

describe('map scenery', () => {
  it.each(['campus', 'island'] as SkinId[])('%s: fills the map, stays off the road and clear of every building', (skin) => {
    const items = scatterScenery(skin);
    expect(items.length).toBeGreaterThan(skin === 'campus' ? 24 : 14);
    const road = roadSamples();
    for (const d of items) {
      expect(Math.min(...road.map((s) => Math.hypot(s.x - d.x, s.y - d.y)))).toBeGreaterThanOrEqual(0.075);
      expect(d.y).toBeLessThan(MAP_HEIGHT);
      for (const p of PLACES) {
        const b = placeBox(p, 0.8);
        const overlaps = d.x - d.w / 2 < b.x + b.w / 2 && d.x + d.w / 2 > b.x - b.w / 2 && d.y - d.h < b.bottom && d.y > b.labelTop;
        expect(overlaps ? `${d.id} over ${p.id}` : null).toBeNull();
      }
    }
    // Drawn back to front.
    expect(items.map((d) => d.y)).toEqual([...items.map((d) => d.y)].sort((a, b) => a - b));
  });

  it.each(['campus', 'island'] as SkinId[])('%s: mostly the plain tree, some showy ones, a few props', (skin) => {
    const items = scatterScenery(skin);
    const [plain, ...showy] = DECO_KINDS[skin].tree;
    const count = (id: string) => items.filter((d) => d.id === id).length;
    for (const s of showy) expect(count(plain)).toBeGreaterThanOrEqual(count(s));
    const props = items.filter((d) => DECO_KINDS[skin].prop.includes(d.id)).length;
    expect(props).toBeGreaterThan(0);
    expect(props).toBeLessThanOrEqual(12);
  });

  it('is the same every time', () => {
    expect(scatterScenery('campus')).toEqual(scatterScenery('campus'));
  });

  it.each(['campus', 'island'] as SkinId[])('%s: flags, fountains and gulls stay clear of buildings, the road and the scenery', (skin) => {
    const road = roadSamples();
    const scenery = scatterScenery(skin);
    for (const a of AMBIENT[skin]) {
      const b = ambientBox(a);
      expect(b.y0).toBeGreaterThan(0.3);
      expect(b.y1).toBeLessThanOrEqual(MAP_HEIGHT);
      for (const p of PLACES) {
        const pb = placeBox(p, 0.8);
        const hit = b.x0 < pb.x + pb.w / 2 && b.x1 > pb.x - pb.w / 2 && b.y0 < pb.bottom && b.y1 > pb.labelTop;
        expect(hit ? `${a.kind}@${a.x},${a.y} over ${p.id}` : null).toBeNull();
      }
      if (a.kind === 'seagulls') continue; // gulls fly over the sea, above everything
      const cy = (b.y0 + b.y1) / 2;
      expect(Math.min(...road.map((s) => Math.hypot(s.x - a.x, s.y - cy)))).toBeGreaterThan(0.06 + a.w / 2);
      for (const d of scenery) {
        const hit = b.x0 < d.x + d.w / 2 && b.x1 > d.x - d.w / 2 && b.y0 < d.y && b.y1 > d.y - d.h;
        expect(hit ? `${d.id} over ${a.kind}@${a.x},${a.y}` : null).toBeNull();
      }
    }
  });
});
