/**
 * Scenery for the map: trees fill the open ground and props (lamps, benches, signs) line the road,
 * scattered with a fixed seed so the map looks the same every visit. Pure (no Skia), so the
 * placement rules are unit-tested. Units are screen widths; (x, y) is a sprite's bottom centre.
 */
import { ANIMS } from '../art/anims';
import { createRng } from '../sim/rng';
import { DECO_KINDS, DECO_WIDTH, decoList } from './art';
import { placeBox } from './layout';
import { MAP_HEIGHT, PLACES, roadSamples, spurFor } from './map';
import type { SkinId } from './skins';

export interface SceneryItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type AmbientKind = 'flag' | 'fountain' | 'seagulls';

/** An animated touch on the map: x, y is the bottom centre (flags, fountains) or the centre (gulls, in the sky). */
export interface AmbientItem {
  kind: AmbientKind;
  x: number;
  y: number;
  w: number;
}

export const AMBIENT_ANIM = { flag: ANIMS.fxFlag, fountain: ANIMS.fxFountain, seagulls: ANIMS.fxSeagulls };

/**
 * Hand-placed in open ground near the road (found by searching the layout; the tests keep them
 * clear of buildings and the road). Pennants flank the gate road and the hall at the top, fountains
 * sit on the lawns, and on the island two gulls circle over the sea.
 */
export const AMBIENT: Record<SkinId, AmbientItem[]> = {
  campus: [
    { kind: 'flag', x: 0.26, y: 4.84, w: 0.09 },
    { kind: 'flag', x: 0.72, y: 4.88, w: 0.09 },
    { kind: 'fountain', x: 0.12, y: 4.75, w: 0.17 },
    { kind: 'flag', x: 0.2, y: 2.05, w: 0.09 },
    { kind: 'fountain', x: 0.36, y: 1.05, w: 0.17 },
    { kind: 'flag', x: 0.76, y: 0.9, w: 0.09 },
  ],
  island: [
    { kind: 'flag', x: 0.26, y: 4.84, w: 0.09 },
    { kind: 'seagulls', x: 0.9, y: 4.82, w: 0.17 },
    { kind: 'seagulls', x: 0.065, y: 2.2, w: 0.13 },
    { kind: 'flag', x: 0.76, y: 0.9, w: 0.09 },
    { kind: 'seagulls', x: 0.1, y: 0.85, w: 0.17 },
  ],
};

/** An ambient item's box on the map (top-left x0, y0 to bottom-right x1, y1). */
export function ambientBox(a: AmbientItem): { x0: number; y0: number; x1: number; y1: number } {
  const h = a.w / AMBIENT_ANIM[a.kind].aspect;
  return a.kind === 'seagulls' ? { x0: a.x - a.w / 2, y0: a.y - h / 2, x1: a.x + a.w / 2, y1: a.y + h / 2 } : { x0: a.x - a.w / 2, y0: a.y - h, x1: a.x + a.w / 2, y1: a.y };
}

const MAX_ITEMS = 46;
const MAX_PROPS = 12;
/** Placement footprint, the same for every tree, so the tree mix isn't skewed by sprite shape. */
const TREE_BOX = { w: 0.16, h: 0.18 };
const PROP_BOX = { w: 0.12, h: 0.14 };
/** How often each tree appears: the plain tree most, the showy ones less. */
const TREE_MIX = [0.5, 0.25, 0.25];

export function scatterScenery(skin: SkinId): SceneryItem[] {
  const rng = createRng(skin === 'campus' ? 11 : 23);
  const samples = roadSamples();
  const spurPts = PLACES.filter((x) => x.kind === 'spot').flatMap((p) => {
    const { from, to } = spurFor(p);
    return Array.from({ length: 8 }, (_, k) => ({ x: from.x + ((to.x - from.x) * k) / 7, y: from.y + ((to.y - from.y) * k) / 7 }));
  });
  // Each building's sprite and label, with a margin (sized for a tallish sprite, to be safe), and the flags and fountains.
  const keepOut = [
    ...PLACES.map((p) => {
      const b = placeBox(p, 0.8);
      return { x0: b.x - b.w / 2 - 0.02, x1: b.x + b.w / 2 + 0.02, y0: b.labelTop - 0.02, y1: b.bottom + 0.05 };
    }),
    ...AMBIENT[skin]
      .filter((a) => a.kind !== 'seagulls')
      .map((a) => {
        const b = ambientBox(a);
        return { x0: b.x0 - 0.03, x1: b.x1 + 0.03, y0: b.y0 - 0.03, y1: b.y1 + 0.05 };
      }),
  ];
  const { tree, prop } = DECO_KINDS[skin];
  const aspect = Object.fromEntries(decoList(skin).map((d) => [d.id, d.sprite.aspect]));
  const out: SceneryItem[] = [];
  let props = 0;
  for (let tries = 0; tries < 4000 && out.length < MAX_ITEMS; tries++) {
    const x = 0.05 + rng() * 0.9;
    const y = 0.4 + rng() * (MAP_HEIGHT - 0.45);
    const roadDist = Math.min(...samples.map((s) => Math.hypot(s.x - x, s.y - y)));
    const spurDist = Math.min(...spurPts.map((s) => Math.hypot(s.x - x, s.y - y)));
    const kind = rng();
    const pick = rng();
    const scale = 0.85 + rng() * 0.3;
    if (roadDist < 0.075 || spurDist < 0.06) continue;
    // On the island, scenery stays on the land (a strip along the road).
    if (skin === 'island' && roadDist > 0.28) continue;
    const isProp = roadDist < 0.13 && props < MAX_PROPS && kind < 0.6;
    const foot = isProp ? PROP_BOX : TREE_BOX;
    const box = { x0: x - foot.w / 2, x1: x + foot.w / 2, y0: y - foot.h, y1: y };
    if (keepOut.some((k) => box.x0 < k.x1 && box.x1 > k.x0 && box.y0 < k.y1 && box.y1 > k.y0)) continue;
    if (out.some((t) => Math.hypot(t.x - x, t.y - y) < (Math.max(t.w, 0.1) + foot.w) * 0.42)) continue;
    const id = isProp ? prop[Math.floor(pick * prop.length)] : tree[pick < TREE_MIX[0] ? 0 : pick < TREE_MIX[0] + TREE_MIX[1] ? 1 : 2];
    const w = DECO_WIDTH[id] * scale;
    if (isProp) props++;
    out.push({ id, x, y, w, h: w / aspect[id] });
  }
  return out.sort((a, b) => a.y - b.y); // farther back first
}
