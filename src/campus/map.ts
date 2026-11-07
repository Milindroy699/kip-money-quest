/**
 * The campus map: Worlds 1–9 as buildings along one road that Kip walks, plus activity spots
 * (Kip Run, reviews, Dividend Day, Practice Portfolio, Market Duel) that open as the player learns.
 * Pure TypeScript (no React), so layout and unlock rules are unit-tested.
 *
 * Coordinates are in screen widths: x from 0 (left) to 1 (right), y from 0 (top) down to MAP_HEIGHT.
 * The road starts at the gate at the bottom and climbs to World 9 at the top.
 */
import { isLessonUnlocked, nextLesson, getWorldOfLesson, WORLDS, type Track } from '../content';
import { duelUnlocked } from '../content/unlocks';

export type SpotId = 'track' | 'library' | 'bank' | 'lab' | 'arena';
export type PlaceKind = 'gate' | 'world' | 'spot';

export interface Pt {
  x: number;
  y: number;
}

export interface Place extends Pt {
  id: string;
  kind: PlaceKind;
  /** Tile width, in screen widths. */
  size: number;
}

export const MAP_HEIGHT = 5;
const WORLD_SIZE = 0.34;
const SPOT_SIZE = 0.22;
const GATE_SIZE = 0.26;

/** Building centres, bottom (World 1) to top (World 9), alternating sides of the road. */
const WORLD_XY: Record<string, Pt> = {
  w1: { x: 0.3, y: 4.22 },
  w2: { x: 0.7, y: 3.78 },
  w3: { x: 0.3, y: 3.34 },
  w4: { x: 0.7, y: 2.9 },
  w5: { x: 0.3, y: 2.46 },
  w6: { x: 0.7, y: 2.02 },
  w7: { x: 0.3, y: 1.58 },
  w8: { x: 0.7, y: 1.14 },
  w9: { x: 0.5, y: 0.52 },
};

/** Activity spots sit on the far side of the road, next to the world where they open. */
const SPOT_XY: Record<SpotId, Pt> = {
  track: { x: 0.8, y: 4.42 },
  library: { x: 0.2, y: 3.82 },
  bank: { x: 0.8, y: 3.38 },
  lab: { x: 0.2, y: 2.9 },
  arena: { x: 0.8, y: 2.5 },
};

export const GATE: Place = { id: 'gate', kind: 'gate', x: 0.5, y: 4.72, size: GATE_SIZE };

export const WORLD_IDS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9'] as const;
export const SPOT_IDS: SpotId[] = ['track', 'library', 'bank', 'lab', 'arena'];

export const PLACES: Place[] = [
  GATE,
  ...WORLD_IDS.map((id) => ({ id, kind: 'world' as const, ...WORLD_XY[id], size: WORLD_SIZE })),
  ...SPOT_IDS.map((id) => ({ id, kind: 'spot' as const, ...SPOT_XY[id], size: SPOT_SIZE })),
];

export function placeById(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

/** Where Kip stands at a place: on the doorstep, just below the tile, on the road. */
export function doorOf(p: Place): Pt {
  return { x: p.x, y: p.y + p.size * 0.78 };
}

// ---- The road ---------------------------------------------------------------------------

/** The points the road passes through, in walking order: the gate, then each world's door. */
export const ROAD_STOPS: string[] = ['gate', ...WORLD_IDS];

export interface Cubic {
  from: Pt;
  c1: Pt;
  c2: Pt;
  to: Pt;
}

/** A smooth road through every stop (Catmull-Rom turned into cubic Bézier segments). */
export function roadSegments(): Cubic[] {
  const pts = ROAD_STOPS.map((id) => doorOf(placeById(id)!));
  const segs: Cubic[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    segs.push({
      from: p1,
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      to: p2,
    });
  }
  return segs;
}

function cubicAt(c: Cubic, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return { x: a * c.from.x + b * c.c1.x + d * c.c2.x + e * c.to.x, y: a * c.from.y + b * c.c1.y + d * c.c2.y + e * c.to.y };
}

export const SAMPLES_PER_SEGMENT = 24;

/** The road as dense points. Stop k sits at index k × SAMPLES_PER_SEGMENT. */
export function roadSamples(): Pt[] {
  const segs = roadSegments();
  const out: Pt[] = [];
  segs.forEach((s, i) => {
    for (let k = i === 0 ? 0 : 1; k <= SAMPLES_PER_SEGMENT; k++) out.push(cubicAt(s, k / SAMPLES_PER_SEGMENT));
  });
  return out;
}

const SAMPLES = roadSamples();

export function stopIndex(id: string): number {
  const i = ROAD_STOPS.indexOf(id);
  return i < 0 ? -1 : i * SAMPLES_PER_SEGMENT;
}

/** The points Kip walks through from one road stop to another (either direction). */
export function walkPath(fromId: string, toId: string): Pt[] {
  const a = stopIndex(fromId);
  const b = stopIndex(toId);
  if (a < 0 || b < 0) return [];
  return a <= b ? SAMPLES.slice(a, b + 1) : SAMPLES.slice(b, a + 1).reverse();
}

export function pathLength(pts: Pt[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return len;
}

/** The short side path from a spot to the nearest point on the main road. */
export function spurFor(p: Place): { from: Pt; to: Pt } {
  const door = doorOf(p);
  let best = SAMPLES[0];
  let bestD = Infinity;
  for (const s of SAMPLES) {
    const d = Math.hypot(s.x - door.x, s.y - door.y);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return { from: door, to: best };
}

// ---- Progress on the map ----------------------------------------------------------------

export type WorldStatus = 'done' | 'current' | 'open' | 'locked' | 'builderOnly';

export function worldStatus(worldId: string, completed: Record<string, unknown>, track: Track): WorldStatus {
  const world = WORLDS.find((w) => w.id === worldId);
  if (!world) return 'locked';
  if (track === 'explorer' && world.track === 'builder') return 'builderOnly';
  if (world.lessons.every((l) => completed[l.id])) return 'done';
  const next = nextLesson(completed, track);
  if (next && getWorldOfLesson(next.id)?.id === worldId) return 'current';
  return world.lessons.some((l) => isLessonUnlocked(l.id, completed, track)) ? 'open' : 'locked';
}

/** Where Kip waits: the building with the next lesson; the gate while Money Town is unfinished. */
export function kipHome(completed: Record<string, unknown>, track: Track): string {
  const next = nextLesson(completed, track);
  if (!next) return 'w9';
  const world = getWorldOfLesson(next.id)?.id ?? 'w0';
  return world === 'w0' ? 'gate' : world;
}

export interface SpotContext {
  completed: Record<string, unknown>;
  reviewsDue: number;
  dividendReady: boolean;
  /** Has claimed Dividend Day before (keeps the bank open for existing players). */
  dividendClaimedBefore: boolean;
  /** Has coins in the Practice Portfolio (keeps the lab open for existing players). */
  portfolioStarted: boolean;
}

export interface SpotState {
  unlocked: boolean;
  /** A short badge on the tile, e.g. "3" reviews due or "Ready". */
  badge: string | null;
  /** Why it's closed and when it opens. */
  lockedText: string;
}

export function spotState(id: SpotId, ctx: SpotContext): SpotState {
  const done = ctx.completed;
  switch (id) {
    case 'track':
      return { unlocked: true, badge: null, lockedText: '' };
    case 'library': {
      const unlocked = Object.keys(done).length > 0;
      return { unlocked, badge: unlocked && ctx.reviewsDue > 0 ? String(ctx.reviewsDue) : null, lockedText: 'Opens after your first lesson. Lessons come back here for quick reviews.' };
    }
    case 'bank': {
      const unlocked = !!done['w0-l4'] || ctx.dividendClaimedBefore;
      return { unlocked, badge: unlocked && ctx.dividendReady ? 'Ready' : null, lockedText: 'Opens when you finish Money Town on Home.' };
    }
    case 'lab': {
      const unlocked = !!done['w1-l4'] || ctx.portfolioStarted;
      return { unlocked, badge: null, lockedText: 'Opens after The Melt, lesson 4, once you know your first product: the Fixed Deposit.' };
    }
    case 'arena': {
      const unlocked = duelUnlocked(done);
      return { unlocked, badge: null, lockedText: 'Opens at Risk Ridge, lesson 3. Duels need you to know risk first.' };
    }
  }
}

/** Spots that are open now but the player hasn't visited yet ("New!" on the map and on Home). */
export function newSpots(ctx: SpotContext, seen: readonly string[]): SpotId[] {
  return SPOT_IDS.filter((id) => id !== 'track' && spotState(id, ctx).unlocked && !seen.includes(id));
}

export const SPOT_HREF: Record<SpotId, '/run/inflation' | '/quiz' | '/dividend' | '/portfolio' | '/duel?vs=dash'> = {
  track: '/run/inflation',
  library: '/quiz', // the Library hub: reviews + Quiz Battle
  bank: '/dividend',
  lab: '/portfolio',
  arena: '/duel?vs=dash',
};
