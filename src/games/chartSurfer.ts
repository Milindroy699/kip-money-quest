/**
 * Chart Surfer (World 8): Kip surfs the newest edge of a price chart. The past is drawn behind
 * him (candles, a moving-average rail, support and resistance lines); the future is fog.
 *
 * - Action: tap to jump for high coins, over Dash's hot-tip bubbles and over overnight news gaps.
 * - Reads: at planted setups (support, resistance, double bottom, head-and-shoulders, a trend
 *   pulling back to its average) time slows and you call it: up or down. Calling the textbook
 *   read earns coins, because that's good reasoning. Then the market plays out, and textbook
 *   patterns only follow through about 6 times in 10, as in real markets.
 *
 * The lesson: charts show what buyers and sellers did, and patterns tilt the odds a little.
 * They don't promise what happens next.
 */
import { createRng, normal, shuffle, type Rng } from '../sim/rng';

export type Dir = 'up' | 'down';
export type SetupKind = 'support' | 'resistance' | 'doubleBottom' | 'headShoulders' | 'trend';

export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  /** Opened away from the last close (overnight news). */
  gap?: boolean;
}

export interface Setup {
  kind: SetupKind;
  /** Candle index where the read happens (the outcome follows). */
  at: number;
  /** Candle index where the setup's level starts to matter (for drawing). */
  from: number;
  /** Support, resistance or neckline price. */
  level: number;
  textbook: Dir;
  actual: Dir;
}

export interface SurfItem {
  kind: 'coin' | 'tip' | 'gap';
  /** Candle index (fractional). */
  at: number;
  /** 0 = at board height, 1 = needs a jump. */
  lift: 0 | 1;
  done?: boolean;
}

export interface Course {
  candles: Candle[];
  setups: Setup[];
  items: SurfItem[];
  /** Moving average of closes. */
  ma: number[];
}

export const SURF = {
  /** Candles per second. */
  speed: 2.2,
  jumpTime: 0.7,
  /** Speed while a read is open. */
  readSlow: 0.1,
  /** Seconds to make a read before it closes. */
  readWindow: 6,
  /** Coins for a textbook read. */
  readCoins: 5,
  /** Coins lost to a hot tip or an un-jumped news gap. */
  hitCost: 3,
  setups: 6,
  maLength: 8,
  /** Chance a textbook pattern actually follows through. */
  followThrough: 0.6,
};

export const SETUP_COPY: Record<SetupKind, { name: string; question: string; up: string; down: string; why: string }> = {
  support: {
    name: 'Support',
    question: 'Back at support, where buyers stepped in before. Bounce or break?',
    up: 'Bounce ▲',
    down: 'Break ▼',
    why: 'Support is a price where buyers have stepped in before, so the textbook read is a bounce.',
  },
  resistance: {
    name: 'Resistance',
    question: 'Up at resistance, where sellers took over before. Break out or turn back?',
    up: 'Break out ▲',
    down: 'Turn back ▼',
    why: 'Resistance is a price where sellers have taken over before, so the textbook read is a turn back.',
  },
  doubleBottom: {
    name: 'Double bottom',
    question: 'Two bottoms at the same price: a "W". Up or down next?',
    up: 'Up ▲',
    down: 'Down ▼',
    why: 'A double bottom shows buyers defending a price twice. The textbook read is up.',
  },
  headShoulders: {
    name: 'Head and shoulders',
    question: 'Shoulder, higher head, lower shoulder, now at the neckline. Up or down?',
    up: 'Up ▲',
    down: 'Down ▼',
    why: 'Head and shoulders shows buyers running out of steam. The textbook read is down.',
  },
  trend: {
    name: 'Trend and average',
    question: 'An uptrend has pulled back to its moving average. Continue or reverse?',
    up: 'Continue ▲',
    down: 'Reverse ▼',
    why: 'In an uptrend, dips to the moving average often find buyers. The textbook read is up.',
  },
};

const TEXTBOOK: Record<SetupKind, Dir> = { support: 'up', resistance: 'down', doubleBottom: 'up', headShoulders: 'down', trend: 'up' };

/** Closes from `from` to `to` over `n` candles, with a little noise. */
function walk(rng: Rng, closes: number[], to: number, n: number, noise = 0.004) {
  const from = closes[closes.length - 1];
  for (let i = 1; i <= n; i++) {
    const target = from + ((to - from) * i) / n;
    closes.push(i === n ? to * (1 + noise * 0.3 * normal(rng)) : target * (1 + noise * normal(rng)));
  }
}

export function makeCourse(seed: number, setupCount = SURF.setups): Course {
  const rng = createRng(seed);
  const closes = [100];
  const gapsAt = new Set<number>();
  const setups: Setup[] = [];
  walk(rng, closes, 102, 10);
  const kinds: SetupKind[] = ['support', 'trend', 'resistance', 'doubleBottom', 'headShoulders'];
  const order = shuffle(rng, kinds);
  while (order.length < setupCount) order.push(kinds[Math.floor(rng() * kinds.length)]);
  for (let k = 0; k < setupCount; k++) {
    const kind = order[k];
    const p = closes[closes.length - 1];
    const from = closes.length - 1;
    let level = p;
    switch (kind) {
      case 'support':
        level = p * 0.95;
        walk(rng, closes, level, 5);
        walk(rng, closes, p * 0.99, 4);
        walk(rng, closes, level, 4);
        break;
      case 'resistance':
        level = p * 1.05;
        walk(rng, closes, level, 5);
        walk(rng, closes, p * 1.01, 4);
        walk(rng, closes, level, 4);
        break;
      case 'doubleBottom':
        level = p * 0.94;
        walk(rng, closes, level, 5);
        walk(rng, closes, level * 1.045, 4);
        walk(rng, closes, level, 4);
        break;
      case 'headShoulders':
        level = p;
        walk(rng, closes, p * 1.04, 3);
        walk(rng, closes, p, 3);
        walk(rng, closes, p * 1.08, 4);
        walk(rng, closes, p, 4);
        walk(rng, closes, p * 1.035, 3);
        walk(rng, closes, p, 3);
        break;
      case 'trend':
        walk(rng, closes, p * 1.07, 8, 0.003);
        walk(rng, closes, p * 1.045, 3, 0.003);
        level = closes[closes.length - 1];
        break;
    }
    const at = closes.length - 1;
    const textbook = TEXTBOOK[kind];
    const actual: Dir = rng() < SURF.followThrough ? textbook : textbook === 'up' ? 'down' : 'up';
    const q = closes[at];
    walk(rng, closes, actual === 'up' ? q * 1.055 : q * 0.945, 6);
    // A calm stretch between setups, sometimes with an overnight gap.
    const drift = 1 + 0.01 * normal(rng);
    if (k < setupCount - 1 && rng() < 0.6) gapsAt.add(closes.length + 1);
    walk(rng, closes, closes[closes.length - 1] * drift, 4);
    setups.push({ kind, at, from, level, textbook, actual });
  }
  walk(rng, closes, closes[closes.length - 1] * 1.01, 8);

  const candles: Candle[] = closes.map((c, i) => {
    const prev = i ? closes[i - 1] : c;
    const gap = gapsAt.has(i);
    const o = gap ? prev * (1 + (rng() < 0.5 ? -1 : 1) * (0.018 + rng() * 0.012)) : prev;
    return { o, c, h: Math.max(o, c) * (1 + rng() * 0.006), l: Math.min(o, c) * (1 - rng() * 0.006), gap };
  });
  const ma = closes.map((_, i) => {
    const w = closes.slice(Math.max(0, i - SURF.maLength + 1), i + 1);
    return w.reduce((a, b) => a + b, 0) / w.length;
  });

  // Coins and hot tips in the calm stretches; gaps where the course has them. Nothing during reads.
  const items: SurfItem[] = [];
  const busy = (i: number) => setups.some((s) => i >= s.at - 1 && i <= s.at + 2);
  for (let i = 4; i < candles.length - 6; i += 1.4) {
    const ci = Math.round(i);
    if (busy(ci) || gapsAt.has(ci) || gapsAt.has(ci + 1)) continue;
    const r = rng();
    if (r < 0.1) items.push({ kind: 'tip', at: i, lift: 0 });
    else items.push({ kind: 'coin', at: i, lift: r < 0.5 ? 1 : 0 });
  }
  for (const g of gapsAt) items.push({ kind: 'gap', at: g - 0.5, lift: 0 });
  items.sort((a, b) => a.at - b.at);
  return { candles, setups, items, ma };
}

export type SurfEventKind = 'coin' | 'tipHit' | 'tipCleared' | 'gapHit' | 'gapCleared' | 'readOpen' | 'readRight' | 'readWrong' | 'readMissed' | 'outcome' | 'jump' | 'finished';

export interface SurfEvent {
  kind: SurfEventKind;
  amount?: number;
  setup?: Setup;
}

export interface ReadRecord {
  setup: Setup;
  answer: Dir | null;
}

export interface SurfState {
  course: Course;
  time: number;
  /** Kip's position, in candles. */
  pos: number;
  jumpT: number;
  coins: number;
  /** The read waiting for an answer, if any, and how long is left. */
  read: Setup | null;
  readLeft: number;
  reads: ReadRecord[];
  /** Setups whose outcome has been revealed. */
  revealed: number;
  tipsHit: number;
  tipsCleared: number;
  gapsHit: number;
  gapsCleared: number;
  coinsCollected: number;
  over: boolean;
  events: SurfEvent[];
}

/** Candles shown behind Kip; the course ends this far from its last candle. */
export const SURF_BEHIND = 16;

export function createSurf(seed: number): SurfState {
  return {
    course: makeCourse(seed),
    time: 0,
    pos: 3,
    jumpT: 0,
    coins: 0,
    read: null,
    readLeft: 0,
    reads: [],
    revealed: 0,
    tipsHit: 0,
    tipsCleared: 0,
    gapsHit: 0,
    gapsCleared: 0,
    coinsCollected: 0,
    over: false,
    events: [],
  };
}

/** Jump height now, 0..1. */
export const jumpHeight = (s: SurfState) => (s.jumpT > 0 ? Math.sin(Math.PI * (1 - s.jumpT / SURF.jumpTime)) : 0);

export function surfJump(s: SurfState) {
  if (s.over || s.jumpT > 0) return;
  s.jumpT = SURF.jumpTime;
  s.events.push({ kind: 'jump' });
}

export function surfAnswer(s: SurfState, dir: Dir) {
  if (!s.read) return;
  const setup = s.read;
  s.reads.push({ setup, answer: dir });
  s.read = null;
  if (dir === setup.textbook) {
    s.coins += SURF.readCoins;
    s.events.push({ kind: 'readRight', amount: SURF.readCoins, setup });
  } else s.events.push({ kind: 'readWrong', setup });
}

/** Price (close) at a fractional candle position: the line Kip rides. */
export function priceAt(c: Course, pos: number): number {
  const i = Math.max(0, Math.min(Math.floor(pos), c.candles.length - 1));
  const j = Math.min(i + 1, c.candles.length - 1);
  const f = pos - i;
  const next = c.candles[j];
  // Across a gap the line jumps at the open, then runs to the close.
  const start = c.candles[i].c;
  const end = next.c;
  if (next.gap) return f < 0.5 ? start : next.o + (end - next.o) * ((f - 0.5) / 0.5);
  return start + (end - start) * f;
}

export function stepSurf(s: SurfState, dt: number) {
  if (s.over) return;
  const d = Math.min(dt, 0.05);
  s.time += d;
  s.jumpT = Math.max(s.jumpT - d, 0);
  const before = s.pos;
  if (s.read) {
    s.readLeft -= d;
    s.pos += SURF.speed * SURF.readSlow * d;
    if (s.readLeft <= 0) {
      s.reads.push({ setup: s.read, answer: null });
      s.events.push({ kind: 'readMissed', setup: s.read });
      s.read = null;
    }
  } else s.pos += SURF.speed * d;

  // Open a read when Kip reaches a setup.
  const next = s.course.setups[s.reads.length + (s.read ? 1 : 0)];
  if (!s.read && next && s.pos >= next.at && !s.reads.some((r) => r.setup === next)) {
    s.pos = next.at;
    s.read = next;
    s.readLeft = SURF.readWindow;
    s.events.push({ kind: 'readOpen', setup: next });
  }
  // Reveal outcomes once the market has played them out.
  const reveal = s.course.setups[s.revealed];
  if (reveal && s.pos >= reveal.at + 5 && s.reads.some((r) => r.setup === reveal)) {
    s.revealed += 1;
    s.events.push({ kind: 'outcome', setup: reveal });
  }

  const h = jumpHeight(s);
  for (const it of s.course.items) {
    if (it.done || it.at > s.pos || it.at <= before - 0.01) continue;
    it.done = true;
    if (it.kind === 'coin') {
      const reached = it.lift === 1 ? h > 0.45 : h < 0.6;
      if (reached) {
        s.coins += 1;
        s.coinsCollected += 1;
        s.events.push({ kind: 'coin', amount: 1 });
      }
    } else if (it.kind === 'tip') {
      if (h > 0.35) {
        s.tipsCleared += 1;
        s.events.push({ kind: 'tipCleared' });
      } else {
        const lost = Math.min(SURF.hitCost, s.coins);
        s.coins -= lost;
        s.tipsHit += 1;
        s.events.push({ kind: 'tipHit', amount: lost });
      }
    } else if (h > 0.25) {
      s.gapsCleared += 1;
      s.events.push({ kind: 'gapCleared' });
    } else {
      const lost = Math.min(SURF.hitCost, s.coins);
      s.coins -= lost;
      s.gapsHit += 1;
      s.events.push({ kind: 'gapHit', amount: lost });
    }
  }

  if (s.pos >= s.course.candles.length - 2) {
    s.over = true;
    s.events.push({ kind: 'finished' });
  }
}

/** Kip plays himself: jumps what needs jumping and makes the textbook read. */
export function surfAutopilot(s: SurfState) {
  if (s.read) {
    surfAnswer(s, s.read.textbook);
    return;
  }
  // Jump so the peak lands on the item: about half a jump's travel ahead.
  const ahead = s.course.items.find((it) => !it.done && it.at > s.pos && it.at - s.pos < (SURF.speed * SURF.jumpTime) / 2);
  if (ahead && (ahead.kind !== 'coin' || ahead.lift === 1)) surfJump(s);
}

export interface SurfResult {
  coins: number;
  coinsCollected: number;
  reads: { kind: SetupKind; answer: Dir | null; textbook: Dir; actual: Dir }[];
  readsRight: number;
  heldUp: number;
  tipsHit: number;
  gapsHit: number;
  gapsCleared: number;
  /** Points for the wallet (see RUN_COIN_DIVISOR.chart). */
  score: number;
}

export function surfResult(s: SurfState): SurfResult {
  const reads = s.reads.map((r) => ({ kind: r.setup.kind, answer: r.answer, textbook: r.setup.textbook, actual: r.setup.actual }));
  return {
    coins: s.coins,
    coinsCollected: s.coinsCollected,
    reads,
    readsRight: reads.filter((r) => r.answer === r.textbook).length,
    heldUp: reads.filter((r) => r.actual === r.textbook).length,
    tipsHit: s.tipsHit,
    gapsHit: s.gapsHit,
    gapsCleared: s.gapsCleared,
    score: Math.max(s.coins, 0),
  };
}
