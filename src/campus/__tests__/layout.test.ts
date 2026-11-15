import { spriteFor } from '../art';
import { LABEL_W, placeBox } from '../layout';
import { MAP_HEIGHT, PLACES } from '../map';
import type { SkinId } from '../skins';

type Rect = { name: string; x0: number; y0: number; x1: number; y1: number };

/** The sprite (less its mostly see-through corners) and the label of every place, in both looks. */
function rects(skin: SkinId): Rect[] {
  return PLACES.flatMap((p) => {
    // The open and the "under construction" sprite differ a little; use the taller one.
    const aspect = Math.min(spriteFor(skin, p.id)!.aspect, spriteFor(skin, p.id, true)!.aspect);
    const b = placeBox(p, aspect);
    const lw = LABEL_W[p.kind];
    return [
      { name: `${p.id} sprite`, x0: b.x - b.w / 2 + 0.02, y0: b.top + 0.02, x1: b.x + b.w / 2 - 0.02, y1: b.bottom },
      { name: `${p.id} label`, x0: b.x - lw / 2, y0: b.labelTop, x1: b.x + lw / 2, y1: b.top },
    ];
  });
}

describe('campus map layout', () => {
  it.each(['campus', 'island'] as SkinId[])('%s: every place has art, and no sprite or label overlaps another place', (skin) => {
    const all = rects(skin);
    const clashes: string[] = [];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i];
        const b = all[j];
        if (a.name.split(' ')[0] === b.name.split(' ')[0]) continue;
        if (Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0)) clashes.push(`${a.name} × ${b.name}`);
      }
    }
    expect(clashes).toEqual([]);
    for (const r of all) {
      expect(r.y0).toBeGreaterThan(0.1); // clear of the header card at the top
      expect(r.y1).toBeLessThan(MAP_HEIGHT);
    }
  });
});
