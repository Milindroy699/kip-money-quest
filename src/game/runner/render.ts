/** Draws one frame of Kip Run onto a Skia canvas (pseudo-3D, three lanes). */
import { FilterMode, MipmapMode, PaintStyle, Skia, TileMode, vec, type SkCanvas, type SkFont, type SkImage, type SkPaint } from '@shopify/react-native-skia';

import { colors } from '../../ui/theme';
import { DASH_DROP_CUE_Z, DASH_MEET_CUE_Z, DASH_START_Z, JUMP_TIME, MELT_DANGER_GAP, MELT_MAX_GAP, OVERTAKE_SECONDS, OVERTAKE_SPEED, overtakeZ, SLIDE_TIME, TF_INFO, tfStageAt, VIEW_DISTANCE, type Entity, type RunState } from './engine';

const paints = new Map<string, SkPaint>();
function fill(color: string, alpha = 1): SkPaint {
  const key = `f${color}${alpha}`;
  let p = paints.get(key);
  if (!p) {
    p = Skia.Paint();
    p.setAntiAlias(true);
    p.setColor(Skia.Color(color));
    p.setAlphaf(alpha);
    paints.set(key, p);
  }
  return p;
}
const strokes = new Map<string, SkPaint>();
/** Stroke paints are cached per colour; width is set per call (draw calls copy paint state). */
function stroke(color: string, width: number, alpha = 1): SkPaint {
  const key = `s${color}${alpha}`;
  let p = strokes.get(key);
  if (!p) {
    p = fill(color, alpha).copy();
    p.setStyle(PaintStyle.Stroke);
    strokes.set(key, p);
  }
  p.setStrokeWidth(width);
  return p;
}

/** 3D art drawn in place of the vector shapes once loaded (see src/art). */
export interface Sprites {
  kip?: SkImage | null;
  /** Run-cycle frames (one full stride); when loaded, Kip really runs. */
  kipRun?: SkImage[] | null;
  coin?: SkImage | null;
  investGate?: SkImage | null;
  sipGate?: SkImage | null;
  billboard?: SkImage | null;
  hotTip?: SkImage | null;
  feeToll?: SkImage | null;
  cashOut?: SkImage | null;
  melt?: SkImage | null;
  /** The Melt's chase animation, calm → tendrils out; frames are picked by how close it is. */
  meltChase?: SkImage[] | null;
  /** Dash's run cycle from behind (one stride), for his Hot Tip cameo. */
  dashRun?: SkImage[] | null;
  sky?: SkImage | null;
}

/** Draws `img` centred on x with its bottom at `bottom`, `width` px wide (aspect kept). */
function drawSprite(canvas: SkCanvas, img: SkImage, x: number, bottom: number, width: number, squashY = 1, alpha = 1) {
  const h = (width * img.height()) / img.width() * squashY;
  const paint = alpha < 1 ? fill('#FFFFFF', alpha) : null;
  canvas.drawImageRectOptions(img, Skia.XYWHRect(0, 0, img.width(), img.height()), Skia.XYWHRect(x - width / 2, bottom - h, width, h), FilterMode.Linear, MipmapMode.None, paint);
}

/** Metres per full stride of the run cycle (about 2–3 strides a second at running speed). */
const RUN_CYCLE_METRES = 7;

/*
 * Dash's cameo. When a Hot Tip marked byDash reaches its cue distance, Dash bursts up from behind
 * the camera, sprints past Kip (swerving if they share a lane) and runs ahead in the trap's lane.
 * At higher tiers the trap stays hidden until he reaches its drop point, then pops onto the road;
 * in the Meet Dash tier it's there all along and he simply runs to it. Everything is derived from
 * the trap's distance, so the cameo needs no extra game state.
 */
/** Meet Dash pace: 1.6 = he runs 2.6× Kip's speed, slow enough to watch him go by. */
const DASH_MEET_SPEED = 1.6;
/** He fades out this far beyond where he drops the trap (so he's fully visible as he drops it). */
const DASH_RUN_ON = 14;
const DASH_STRIDE_METRES = 12;
/** Dash's height in lane units (Kip is about 0.9). */
const DASH_HEIGHT = 1.1;

/** Dash's path for a trap: where it starts, and how much faster than Kip he runs to meet its drop point. */
function dashPath(e: Entity): { cue: number; k: number; gone: number } {
  if (e.dropZ == null) return { cue: DASH_MEET_CUE_Z, k: DASH_MEET_SPEED, gone: 55 };
  return { cue: DASH_DROP_CUE_Z, k: (e.dropZ - DASH_START_Z) / (DASH_DROP_CUE_Z - e.dropZ), gone: Math.min(e.dropZ + DASH_RUN_ON, VIEW_DISTANCE - 2) };
}

const SPRITE_WIDTH: Partial<Record<Entity['kind'], number>> = {
  investGate: 1.05,
  sipGate: 1.0,
  billboard: 1.0,
  hotTip: 0.8,
  toll: 0.95,
  cashOut: 0.95,
};

/** Risk Lanes colours, left to right: SAFE, BALANCED, WILD. */
const RISK_COLORS = { safe: '#2DBE7E', balanced: '#F2B544', wild: '#E5484D' } as const;
const RISK_LABELS = { safe: 'SAFE', balanced: 'BALANCED', wild: 'WILD' } as const;

const THEMES = {
  inflation: { skyTop: '#FFD9A8', skyBottom: '#FFF3DE', ground: '#F3DDB2', road: '#E8CB98', roadEdge: '#C99B55', dash: '#FFF6E2', prop: ['#FF8A3D', '#2DBE7E', '#3B9EFF', '#F2B544'] },
  snowball: { skyTop: '#BFE0FF', skyBottom: '#F2F8FF', ground: '#EEF5FB', road: '#D7E6F2', roadEdge: '#9DB9CF', dash: '#FFFFFF', prop: ['#2F855A', '#276749', '#38A169', '#2F855A'] },
  risk: { skyTop: '#FFC9A8', skyBottom: '#FFF1E4', ground: '#EFE3D0', road: '#E6D3B5', roadEdge: '#B98B5B', dash: '#FFF6E2', prop: ['#2DBE7E', '#F2B544', '#E5484D', '#B98B5B'] },
  timeframe: { skyTop: '#FFC6A0', skyBottom: '#FFEBD6', ground: '#EAD9C2', road: '#DDD0BE', roadEdge: '#9C8A73', dash: '#FFF8EC', prop: ['#E5484D', '#F2B544', '#6366F1', '#2DBE7E'] },
} as const;

export interface View3D {
  W: number;
  H: number;
  horizon: number;
  playerY: number;
  unit: number;
}

export function makeView(W: number, H: number): View3D {
  return { W, H, horizon: H * 0.3, playerY: H * 0.8, unit: W * 0.26 };
}

const D = 6.5;
const sOf = (z: number) => D / (D + Math.max(z, -D * 0.6));
const groundY = (v: View3D, z: number) => v.horizon + (v.playerY - v.horizon) * sOf(z);
const laneX = (v: View3D, lane: number, z: number) => v.W / 2 + lane * v.unit * sOf(z);

function label(canvas: SkCanvas, font: SkFont, text: string, x: number, y: number, scale: number, color = '#FFFFFF') {
  if (scale < 0.18) return;
  const w = font.measureText(text).width;
  canvas.save();
  canvas.translate(x, y);
  canvas.scale(scale, scale);
  canvas.drawText(text, -w / 2, 0, fill(color), font);
  canvas.restore();
}

/**
 * Guided Answer Gates: while the question is asked, every gate wears its lane's arrow ('pick'), the
 * same arrows as on the card; once answered, Kip points at the right gate ('right') and the other
 * two step back ('other').
 */
type GateGuide = 'pick' | 'right' | 'other' | null;
let dim: SkPaint | null = null;
/** A layer paint that draws whatever's inside it at 40% opacity (created on first use). */
function dimLayer(): SkPaint {
  if (!dim) {
    dim = Skia.Paint();
    dim.setAlphaf(0.4);
  }
  return dim;
}

function drawEntity(canvas: SkCanvas, v: View3D, e: Entity, t: number, font: SkFont, sprites: Sprites, guide: GateGuide = null) {
  const s = sOf(e.z);
  const x = laneX(v, e.lane, e.z);
  const gy = groundY(v, e.z);
  const u = v.unit * s;
  // Fade in from the horizon so sprites don't pop.
  const fade = Math.min(1, Math.max(0, (VIEW_DISTANCE - e.z) / 12));
  if (e.kind === 'coin' && sprites.coin) {
    const spin = Math.max(Math.abs(Math.cos(t * 4 + e.id)), 0.2);
    const w = 0.34 * u;
    canvas.drawOval(Skia.XYWHRect(x - w * 0.45, gy - 0.05 * u, w * 0.9, 0.09 * u), fill(colors.ink, 0.1 * fade));
    canvas.save();
    canvas.translate(x, 0);
    canvas.scale(spin, 1);
    drawSprite(canvas, sprites.coin, 0, gy - 0.2 * u, w, 1, fade);
    canvas.restore();
    return;
  }
  if (e.kind === 'answer') {
    // Answer Gate: a violet arch with the answer on its banner.
    const w = 0.92 * u;
    const h = 1.15 * u;
    if (guide === 'other') canvas.saveLayer(dimLayer());
    if (guide === 'right') {
      // Kip's pointer: a green glow around the gate and a bouncing arrow above it.
      const glow = 0.25 + 0.15 * Math.sin(t * 8);
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2 - 0.12 * u, gy - h - 0.3 * u, w + 0.24 * u, h + 0.36 * u), 0.12 * u, 0.12 * u), fill(colors.kip, glow * fade));
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2 - 0.12 * u, gy - h - 0.3 * u, w + 0.24 * u, h + 0.36 * u), 0.12 * u, 0.12 * u), stroke(colors.kipDark, 0.05 * u, fade));
      const bob = Math.abs(Math.sin(t * 6)) * 0.18 * u;
      const ay = gy - h - 0.42 * u - bob;
      const arrow = Skia.PathBuilder.Make().moveTo(x - 0.22 * u, ay - 0.3 * u).lineTo(x + 0.22 * u, ay - 0.3 * u).lineTo(x, ay).close().build();
      canvas.drawPath(arrow, fill(colors.kip, fade));
      canvas.drawPath(arrow, stroke('#FFFFFF', 0.04 * u, fade));
    }
    if (guide === 'pick') {
      // The lane's arrow, matching the card: ◀ left, ▲ middle, ▶ right.
      const r = Math.max(0.22 * u, 11);
      const cy = gy - h - 0.16 * u - r - 4;
      canvas.drawCircle(x, cy, r, fill(colors.meltDark, fade));
      canvas.drawCircle(x, cy, r, stroke('#FFFFFF', 2, fade));
      const a = r * 0.5;
      const tri = Skia.PathBuilder.Make();
      if (e.lane === -1) tri.moveTo(x - a, cy).lineTo(x + a * 0.7, cy - a).lineTo(x + a * 0.7, cy + a);
      else if (e.lane === 1) tri.moveTo(x + a, cy).lineTo(x - a * 0.7, cy - a).lineTo(x - a * 0.7, cy + a);
      else tri.moveTo(x, cy - a).lineTo(x + a, cy + a * 0.7).lineTo(x - a, cy + a * 0.7);
      canvas.drawPath(tri.close().build(), fill('#FFFFFF', fade));
    }
    const pulse = 0.14 + 0.06 * Math.sin(t * 5 + e.lane);
    canvas.drawOval(Skia.XYWHRect(x - w * 0.42, gy - 0.06 * u, w * 0.84, 0.12 * u), fill(colors.ink, 0.12 * fade));
    canvas.drawRect(Skia.XYWHRect(x - w / 2, gy - h, w, h), fill(colors.melt, pulse * fade));
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2, gy - h, 0.1 * u, h), 0.04 * u, 0.04 * u), fill(colors.meltDark, fade));
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x + w / 2 - 0.1 * u, gy - h, 0.1 * u, h), 0.04 * u, 0.04 * u), fill(colors.meltDark, fade));
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2 - 0.04 * u, gy - h - 0.16 * u, w + 0.08 * u, 0.34 * u), 0.08 * u, 0.08 * u), fill('#FFFFFF', fade));
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2 - 0.04 * u, gy - h - 0.16 * u, w + 0.08 * u, 0.34 * u), 0.08 * u, 0.08 * u), stroke(colors.meltDark, 0.03 * u, fade));
    const text = e.label ?? '';
    const fit = Math.min(u / 170, (w * 0.92) / Math.max(font.measureText(text).width, 1));
    label(canvas, font, text, x, gy - h + 0.06 * u, fit, colors.ink);
    if (guide === 'other') canvas.restore();
    return;
  }
  let pop = 1;
  if (e.kind === 'hotTip' && e.byDash && e.dropZ != null && sprites.dashRun?.length) {
    if (e.z > e.dropZ) return; // Dash hasn't dropped it yet
    pop = Math.min(1, (e.dropZ - e.z) / 2.5);
  }
  if (e.kind === 'riskGate') {
    // Risk Lanes gate: an arch in its lane's colour, labelled with its risk level.
    const tier = e.tier ?? 'balanced';
    const color = RISK_COLORS[tier];
    const w = 0.9 * u;
    const h = 1.2 * u;
    const pulse = 0.16 + 0.06 * Math.sin(t * 5 + e.lane);
    canvas.drawOval(Skia.XYWHRect(x - w * 0.42, gy - 0.06 * u, w * 0.84, 0.12 * u), fill(colors.ink, 0.12 * fade));
    canvas.drawRect(Skia.XYWHRect(x - w / 2, gy - h, w, h), fill(color, pulse * fade));
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2, gy - h, 0.1 * u, h), 0.04 * u, 0.04 * u), fill(color, fade));
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x + w / 2 - 0.1 * u, gy - h, 0.1 * u, h), 0.04 * u, 0.04 * u), fill(color, fade));
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2 - 0.04 * u, gy - h - 0.14 * u, w + 0.08 * u, 0.3 * u), 0.07 * u, 0.07 * u), fill(color, fade));
    const text = RISK_LABELS[tier];
    const fit = Math.min(u / 210, (w * 0.9) / Math.max(font.measureText(text).width, 1));
    label(canvas, font, text, x, gy - h + 0.07 * u, fit);
    return;
  }
  if (e.kind === 'tradeFee' || e.kind === 'bell') {
    // Time Tracks arches across the whole road: a FEE on every trade, or the 3:30 square-off bell.
    const color = e.kind === 'tradeFee' ? colors.error : colors.shellDark;
    const w = 0.96 * u;
    const h = 1.1 * u;
    canvas.drawOval(Skia.XYWHRect(x - w * 0.42, gy - 0.06 * u, w * 0.84, 0.12 * u), fill(colors.ink, 0.12 * fade));
    canvas.drawRect(Skia.XYWHRect(x - w / 2, gy - h, w, h), fill(color, (0.12 + 0.05 * Math.sin(t * 6)) * fade));
    canvas.drawRect(Skia.XYWHRect(x - w / 2, gy - h, 0.08 * u, h), fill(color, fade));
    canvas.drawRect(Skia.XYWHRect(x + w / 2 - 0.08 * u, gy - h, 0.08 * u, h), fill(color, fade));
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2 - 0.04 * u, gy - h - 0.14 * u, w + 0.08 * u, 0.3 * u), 0.07 * u, 0.07 * u), fill(color, fade));
    const text = e.kind === 'tradeFee' ? 'FEE −1' : '3:30 BELL';
    label(canvas, font, text, x, gy - h + 0.07 * u, Math.min(u / 210, (w * 0.9) / Math.max(font.measureText(text).width, 1)));
    return;
  }
  if (e.kind === 'gap') {
    // An overnight news gap: a dark crack across the lane, with a warning sign beside it.
    const zFar = e.z + 2.4;
    const hole = Skia.PathBuilder.Make();
    hole.moveTo(laneX(v, e.lane - 0.46, e.z), gy);
    hole.lineTo(laneX(v, e.lane + 0.46, e.z), gy);
    hole.lineTo(laneX(v, e.lane + 0.46, zFar), groundY(v, zFar));
    hole.lineTo(laneX(v, e.lane - 0.46, zFar), groundY(v, zFar));
    hole.close();
    canvas.drawPath(hole.build(), fill('#2A2140', 0.92 * fade));
    canvas.drawPath(hole.build(), stroke('#6366F1', Math.max(1, 0.03 * u), fade));
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - 0.42 * u, gy - 0.62 * u, 0.84 * u, 0.26 * u), 0.05 * u, 0.05 * u), fill('#2A2140', fade));
    label(canvas, font, 'NEWS GAP', x, gy - 0.44 * u, u / 250, '#C7D2FE');
    return;
  }
  if (e.kind === 'dividend') {
    // A dividend: a coin with a green glow and a +3 tag.
    const cy = gy - 0.42 * u;
    canvas.drawCircle(x, cy, 0.24 * u * (1 + 0.08 * Math.sin(t * 6)), fill(colors.kip, 0.3 * fade));
    if (sprites.coin) drawSprite(canvas, sprites.coin, x, gy - 0.2 * u, 0.36 * u, 1, fade);
    else canvas.drawCircle(x, cy, 0.15 * u, fill(colors.coin, fade));
    label(canvas, font, '+3', x, gy - 0.72 * u, u / 240, colors.kipDark);
    return;
  }
  const img = { investGate: sprites.investGate, sipGate: sprites.sipGate, billboard: sprites.billboard, hotTip: sprites.hotTip, toll: sprites.feeToll, cashOut: sprites.cashOut, coin: null }[e.kind as 'investGate' | 'sipGate' | 'billboard' | 'hotTip' | 'toll' | 'cashOut' | 'coin'];
  const width = SPRITE_WIDTH[e.kind];
  if (img && width) {
    canvas.drawOval(Skia.XYWHRect(x - width * u * 0.42, gy - 0.06 * u, width * u * 0.84, 0.12 * u), fill(colors.ink, 0.12 * fade));
    if (e.kind === 'investGate' || e.kind === 'sipGate') {
      const pulse = 0.12 + 0.08 * Math.sin(t * 6);
      canvas.drawOval(Skia.XYWHRect(x - 0.5 * u, gy - 0.9 * u, u, 0.9 * u), fill(e.kind === 'sipGate' ? '#14B8A6' : colors.kip, pulse * fade));
    }
    drawSprite(canvas, img, x, gy + 0.02 * u, width * u * (0.4 + 0.6 * pop), 1, fade * pop);
    return;
  }
  switch (e.kind) {
    case 'coin': {
      const spin = Math.abs(Math.cos(t * 5 + e.id));
      const r = 0.15 * u;
      const cy = gy - 0.38 * u;
      canvas.drawOval(Skia.XYWHRect(x - r * 0.9, gy - 0.06 * u, r * 1.8, 0.1 * u), fill(colors.ink, 0.08));
      canvas.drawOval(Skia.XYWHRect(x - r * Math.max(spin, 0.15), cy - r, 2 * r * Math.max(spin, 0.15), 2 * r), fill(colors.coin));
      canvas.drawOval(Skia.XYWHRect(x - r * Math.max(spin, 0.15), cy - r, 2 * r * Math.max(spin, 0.15), 2 * r), stroke(colors.shellDark, Math.max(1, 0.03 * u)));
      break;
    }
    case 'billboard': {
      const w = 0.8 * u;
      canvas.drawRect(Skia.XYWHRect(x - w * 0.42, gy - 1.0 * u, 0.04 * u, 1.0 * u), fill(colors.ink));
      canvas.drawRect(Skia.XYWHRect(x + w * 0.38, gy - 1.0 * u, 0.04 * u, 1.0 * u), fill(colors.ink));
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2, gy - 1.05 * u, w, 0.45 * u), 0.06 * u, 0.06 * u), fill(colors.error));
      const blink = Math.sin(t * 10) > 0 ? colors.coin : '#FFFFFF';
      for (let i = 0; i < 5; i++) canvas.drawCircle(x - w / 2 + (w / 4) * i, gy - 1.05 * u, 0.025 * u, fill(blink));
      label(canvas, font, 'SALE!', x, gy - 0.74 * u, u / 150);
      break;
    }
    case 'toll': {
      const w = 0.8 * u;
      const h = 0.3 * u;
      for (let i = 0; i < 5; i++) canvas.drawRect(Skia.XYWHRect(x - w / 2 + (w / 5) * i, gy - h, w / 5, h * 0.45), fill(i % 2 ? '#FFFFFF' : colors.error));
      canvas.drawRect(Skia.XYWHRect(x - w / 2, gy - h * 0.55, 0.05 * u, h * 0.55), fill(colors.ink));
      canvas.drawRect(Skia.XYWHRect(x + w / 2 - 0.05 * u, gy - h * 0.55, 0.05 * u, h * 0.55), fill(colors.ink));
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - 0.2 * u, gy - h - 0.22 * u, 0.4 * u, 0.2 * u), 0.04 * u, 0.04 * u), fill(colors.ink));
      label(canvas, font, 'FEE', x, gy - h - 0.07 * u, u / 220, colors.coin);
      break;
    }
    case 'hotTip': {
      const path = Skia.PathBuilder.Make();
      path.moveTo(x - 0.3 * u, gy);
      path.lineTo(x + 0.3 * u, gy);
      path.lineTo(x, gy - 0.55 * u);
      path.close();
      canvas.drawPath(path.build(), fill(colors.dash));
      canvas.drawRect(Skia.XYWHRect(x - 0.22 * u, gy - 0.22 * u, 0.44 * u, 0.07 * u), fill('#FFFFFF'));
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - 0.36 * u, gy - 0.95 * u, 0.72 * u, 0.28 * u), 0.05 * u, 0.05 * u), fill(colors.ink));
      label(canvas, font, 'HOT TIP', x, gy - 0.75 * u, u / 230, colors.dash);
      break;
    }
    case 'investGate':
    case 'sipGate': {
      const color = e.kind === 'sipGate' ? '#14B8A6' : colors.kip;
      const w = 0.9 * u;
      const h = 1.25 * u;
      const pulse = 0.18 + 0.1 * Math.sin(t * 6);
      canvas.drawRect(Skia.XYWHRect(x - w / 2, gy - h, w, h), fill(color, pulse));
      canvas.drawRect(Skia.XYWHRect(x - w / 2, gy - h, 0.1 * u, h), fill(color));
      canvas.drawRect(Skia.XYWHRect(x + w / 2 - 0.1 * u, gy - h, 0.1 * u, h), fill(color));
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2 - 0.05 * u, gy - h - 0.1 * u, w + 0.1 * u, 0.3 * u), 0.06 * u, 0.06 * u), fill(color));
      label(canvas, font, e.kind === 'sipGate' ? 'SIP ↑' : 'INVEST ↑', x, gy - h + 0.12 * u, u / 210);
      break;
    }
    case 'cashOut': {
      const w = 0.8 * u;
      const path = Skia.PathBuilder.Make();
      path.moveTo(x - w / 2, gy);
      path.lineTo(x + w / 2, gy);
      path.lineTo(x + w / 2 - 0.1 * u, gy - 0.3 * u);
      path.lineTo(x - w / 2 + 0.1 * u, gy - 0.3 * u);
      path.close();
      canvas.drawPath(path.build(), fill(colors.coin));
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - 0.45 * u, gy - 0.85 * u, 0.9 * u, 0.3 * u), 0.05 * u, 0.05 * u), fill(colors.dash));
      label(canvas, font, 'CASH OUT +15', x, gy - 0.64 * u, u / 260);
      const sparkle = (Math.sin(t * 8 + e.id) + 1) / 2;
      canvas.drawCircle(x + 0.32 * u, gy - 0.4 * u, 0.04 * u * (0.5 + sparkle), fill('#FFFFFF'));
      break;
    }
  }
}

function drawKip(canvas: SkCanvas, v: View3D, s: RunState, t: number, sprites: Sprites) {
  const x = laneX(v, s.laneX, 0);
  const u = v.unit;
  const jump = s.jumpT > 0 ? Math.sin(Math.PI * (1 - s.jumpT / JUMP_TIME)) * 0.9 * u : 0;
  const sliding = s.slideT > 0;
  const squash = sliding ? 0.55 + 0.1 * Math.sin(Math.PI * (1 - s.slideT / SLIDE_TIME)) : 1;
  const base = v.playerY - jump;
  const r = 0.27 * u;

  canvas.drawOval(Skia.XYWHRect(x - r, v.playerY - 0.05 * u, 2 * r, 0.12 * u), fill(colors.ink, Math.max(0.05, 0.15 - jump / (u * 10))));
  if (sprites.kipRun?.length && !sliding) {
    // Real run cycle: the frame follows distance, so his legs speed up as the run speeds up.
    const cycle = s.distance / RUN_CYCLE_METRES;
    const frames = sprites.kipRun;
    const airborne = s.jumpT > 0;
    const frame = frames[airborne ? 0 : Math.floor(cycle * frames.length) % frames.length];
    if (!airborne) drawDust(canvas, v, cycle * 2 * Math.PI, x, u);
    drawSprite(canvas, frame, x, base, 0.66 * u);
    if (s.config.mode === 'snowball') drawSnowball(canvas, v, s, t, x, r);
    return;
  }
  if (sprites.kip) {
    // Jogging, not hopping: about 3 strides a second at running speed. Each stride sways the body
    // toward the planted foot, bobs a little, squashes on landing, and kicks up dust.
    const phase = s.distance * 1.15;
    const stride = Math.sin(phase); // −1..1: which foot is down
    const flight = Math.abs(stride); // 0 at footfall, 1 mid-stride
    const grounded = !sliding && s.jumpT <= 0;
    const bob = grounded ? flight * 0.018 * u : 0;
    const land = grounded ? 1 - flight : 0;
    const sway = grounded ? stride * 0.035 * u : 0;
    if (grounded) drawDust(canvas, v, phase, x, u);
    canvas.save();
    canvas.translate(x + sway, base);
    canvas.rotate(grounded ? stride * 4 : 0, 0, 0);
    canvas.scale(1 + land * 0.035, 1);
    drawSprite(canvas, sprites.kip, 0, -bob, 0.62 * u, squash * (1 - land * 0.045));
    canvas.restore();
    if (s.config.mode === 'snowball') drawSnowball(canvas, v, s, t, x, r);
    return;
  }
  // feet (run cycle)
  if (!sliding) {
    const phase = Math.sin(s.distance * 1.6);
    canvas.drawOval(Skia.XYWHRect(x - r * 0.7, base - 0.12 * u + phase * 0.05 * u, 0.22 * u, 0.14 * u), fill(colors.kip));
    canvas.drawOval(Skia.XYWHRect(x + r * 0.7 - 0.22 * u, base - 0.12 * u - phase * 0.05 * u, 0.22 * u, 0.14 * u), fill(colors.kip));
    // head peeking over the shell
    canvas.drawCircle(x, base - r * 2 * squash - 0.06 * u, 0.13 * u, fill(colors.kip));
    canvas.drawCircle(x - 0.06 * u, base - r * 2 * squash - 0.1 * u, 0.045 * u, stroke(colors.ink, 0.025 * u));
    canvas.drawCircle(x + 0.06 * u, base - r * 2 * squash - 0.1 * u, 0.045 * u, stroke(colors.ink, 0.025 * u));
  }
  // shell dome
  const shell = Skia.XYWHRect(x - r, base - r * 2 * squash - 0.04 * u, 2 * r, r * 2 * squash);
  canvas.drawOval(shell, fill(colors.shell));
  canvas.drawOval(shell, stroke(colors.shellDark, 0.03 * u));
  const hex = Skia.PathBuilder.Make();
  const cy = base - r * squash - 0.04 * u;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    const px = x + Math.cos(a) * r * 0.42;
    const py = cy + Math.sin(a) * r * 0.42 * squash;
    if (i === 0) hex.moveTo(px, py);
    else hex.lineTo(px, py);
  }
  hex.close();
  canvas.drawPath(hex.build(), stroke(colors.shellDark, 0.025 * u));
  // backpack
  canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - 0.11 * u, cy - 0.06 * u * squash, 0.22 * u, 0.18 * u * squash), 0.04 * u, 0.04 * u), fill('#14B8A6'));
  if (s.config.mode === 'snowball') drawSnowball(canvas, v, s, t, x, r);
}

/** Dust kicked up behind Kip's last three footfalls, alternating feet; fades as it drifts back. */
function drawDust(canvas: SkCanvas, v: View3D, phase: number, x: number, u: number) {
  const k = Math.floor(phase / Math.PI);
  for (let j = 0; j < 3; j++) {
    const step = k - j;
    const age = (phase - step * Math.PI) / (3 * Math.PI); // 0 → 1 over three strides
    if (age < 0 || age > 1) continue;
    const side = step % 2 === 0 ? -1 : 1;
    const r = (0.05 + 0.09 * age) * u;
    canvas.drawCircle(x + side * 0.13 * u, v.playerY - 0.02 * u + age * 0.12 * u, r, fill('#E9D3AE', 0.45 * (1 - age)));
  }
}

function drawSnowball(canvas: SkCanvas, v: View3D, s: RunState, t: number, x: number, r: number) {
  const u = v.unit;
  const sr = 0.08 * u * (1 + Math.min(s.snowball, 40) / 14);
  const sx = x + r + sr * 0.8;
  canvas.drawCircle(sx, v.playerY - sr - 0.02 * u, sr, fill('#FFFFFF'));
  canvas.drawCircle(sx, v.playerY - sr - 0.02 * u, sr, stroke('#9DB9CF', 0.02 * u));
  canvas.drawCircle(sx - sr * 0.3 + Math.sin(t * 9) * sr * 0.2, v.playerY - sr * 1.3, sr * 0.15, fill('#D7E6F2'));
}

/** The Hot Tip whose Dash cameo is on screen, if any (spacing in the engine keeps it to one). */
function dashCameo(s: RunState, sprites: Sprites): { e: Entity; z: number } | null {
  if (!sprites.dashRun?.length) return null;
  for (const e of s.entities) {
    if (!e.byDash) continue;
    const { cue, k, gone } = dashPath(e);
    if (e.z > cue) continue;
    const z = DASH_START_Z + (cue - e.z) * k;
    if (z < gone) return { e, z };
  }
  return null;
}

function drawDash(canvas: SkCanvas, v: View3D, s: RunState, sprites: Sprites, cameo: { e: Entity; z: number }) {
  const { e, z } = cameo;
  // Swerve round Kip if they share a lane as Dash goes past.
  const passing = Math.max(0, 1 - Math.abs(z) / 3);
  const side = e.lane !== 0 ? -e.lane : e.id % 2 ? 1 : -1;
  const swerve = side * Math.max(0, 0.8 - Math.abs(e.lane - s.laneX)) * passing;
  // His legs follow the ground he covers, like Kip's (capped, so a fast Dash doesn't blur).
  const { cue, k, gone } = dashPath(e);
  const run = ((cue - e.z) * Math.min(1 + k, 3)) / DASH_STRIDE_METRES;
  drawDashAt(canvas, v, sprites, e.lane + swerve, z, run, Math.min(1, (gone - z) / 12));
}

/** Dash running away from the camera at `lane`/`z`, `run` strides into his cycle, at `fade` opacity. */
function drawDashAt(canvas: SkCanvas, v: View3D, sprites: Sprites, lane: number, z: number, run: number, fade: number) {
  const frames = sprites.dashRun;
  if (!frames?.length || fade <= 0) return;
  const u = v.unit * sOf(z);
  const x = laneX(v, lane, z);
  const gy = groundY(v, z);
  const frame = frames[Math.floor(run * frames.length) % frames.length];
  const w = DASH_HEIGHT * u * (frame.width() / frame.height());
  canvas.drawOval(Skia.XYWHRect(x - w * 0.45, gy - 0.05 * u, w * 0.9, 0.1 * u), fill(colors.ink, 0.13 * fade));
  drawSprite(canvas, frame, x, gy + 0.02 * u, w, 1, fade);
}

/** Dash overtaking Kip after a slip: he bursts past in the next lane and runs off up the road. */
function drawOvertake(canvas: SkCanvas, v: View3D, s: RunState, sprites: Sprites, z: number) {
  if (!s.overtake) return;
  const t = s.time - s.overtake.start;
  const fadeIn = Math.min(1, t / 0.15);
  const fadeOut = Math.min(1, (OVERTAKE_SECONDS - t) / 0.35);
  // A small lean toward Kip's lane as he draws level, so it reads as passing him.
  const lean = (s.laneX - s.overtake.lane) * 0.18 * Math.max(0, 1 - Math.abs(z) / 4);
  drawDashAt(canvas, v, sprites, s.overtake.lane + lean, z, (t * (s.speed + OVERTAKE_SPEED)) / DASH_STRIDE_METRES, Math.min(fadeIn, fadeOut));
}

function drawMelt(canvas: SkCanvas, v: View3D, s: RunState, t: number, sprites: Sprites) {
  const closeness = 1 - s.meltGap / MELT_MAX_GAP;
  const fogH = v.H * (0.05 + 0.3 * Math.max(closeness, 0));
  const top = v.H - fogH;
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const cx = (v.W / n) * i;
    const wobble = Math.sin(t * 2.2 + i * 1.3) * fogH * 0.12;
    canvas.drawCircle(cx, top + fogH * 0.45 + wobble, fogH * 0.55, fill(colors.melt, 0.78));
  }
  canvas.drawRect(Skia.XYWHRect(0, top + fogH * 0.45, v.W, fogH), fill(colors.melt, 0.82));
  const c = Math.min(Math.max(closeness, 0), 1);
  const chase = sprites.meltChase;
  if (chase?.length) {
    // Real animation: calm and small when far behind, tendrils reaching when close. A window of
    // frames slides with closeness and plays back and forth inside it, so the fog keeps billowing.
    const span = Math.min(8, chase.length);
    const lo = Math.round(c * (chase.length - span));
    const k = Math.floor(t * 10) % (2 * span - 2);
    const img = chase[lo + (k < span ? k : 2 * span - 2 - k)];
    // Sized and sunk into the fog so it stays below Kip's feet until it's really closing in.
    drawSprite(canvas, img, v.W * 0.5 + Math.sin(t * 1.3) * v.W * 0.05, top + fogH * 0.95 + Math.sin(t * 2.4) * 4, v.W * (0.5 + 0.35 * c), 1, 0.97);
  } else if (sprites.melt) {
    // The Melt itself rises out of the fog as it closes in.
    const w = v.W * (0.32 + 0.3 * c);
    drawSprite(canvas, sprites.melt, v.W * 0.5 + Math.sin(t * 1.3) * v.W * 0.08, top + fogH * 0.75 + Math.sin(t * 2.4) * 6, w, 1, 0.95);
  }
  if (s.meltGap < MELT_DANGER_GAP) {
    const ex = v.W * 0.5;
    const ey = top + fogH * 0.35;
    if (!sprites.melt && !chase?.length) {
      const blink = Math.sin(t * 3) > 0.95 ? 0.2 : 1;
      canvas.drawOval(Skia.XYWHRect(ex - 46, ey - 9 * blink, 30, 18 * blink), fill('#FFFFFF'));
      canvas.drawOval(Skia.XYWHRect(ex + 16, ey - 9 * blink, 30, 18 * blink), fill('#FFFFFF'));
      canvas.drawCircle(ex - 31, ey, 5, fill(colors.ink));
      canvas.drawCircle(ex + 31, ey, 5, fill(colors.ink));
    }
    // purple vignette
    const vignette = Skia.Paint();
    vignette.setShader(Skia.Shader.MakeLinearGradient(vec(0, v.H * 0.5), vec(0, v.H), [Skia.Color('rgba(139,92,246,0)'), Skia.Color('rgba(139,92,246,0.35)')], null, TileMode.Clamp));
    canvas.drawRect(Skia.XYWHRect(0, v.H * 0.5, v.W, v.H * 0.5), vignette);
  }
}

export function drawFrame(canvas: SkCanvas, v: View3D, s: RunState, t: number, font: SkFont, sprites: Sprites = {}) {
  const theme = THEMES[s.config.mode];
  if (sprites.sky) {
    // Painted world backdrop: the bottom (town / hills) band of the art sits on the horizon.
    const img = sprites.sky;
    const srcH = img.width() * ((v.horizon + 40) / v.W);
    const srcY = Math.max(img.height() * 0.78 - srcH, 0);
    canvas.drawImageRectOptions(img, Skia.XYWHRect(0, srcY, img.width(), srcH), Skia.XYWHRect(0, 0, v.W, v.horizon + 40), FilterMode.Linear, MipmapMode.None, null);
  } else {
    const sky = Skia.Paint();
    sky.setShader(Skia.Shader.MakeLinearGradient(vec(0, 0), vec(0, v.horizon), [Skia.Color(theme.skyTop), Skia.Color(theme.skyBottom)], null, TileMode.Clamp));
    canvas.drawRect(Skia.XYWHRect(0, 0, v.W, v.horizon + 1), sky);
    for (let i = 0; i < 6; i++) {
      const hx = (i * v.W) / 4.5 + (i % 2) * 30;
      canvas.drawCircle(hx, v.horizon + 30, 70 + (i % 3) * 25, fill(s.config.mode === 'snowball' ? '#E3EEF8' : '#F4C98E', 0.9));
    }
  }
  canvas.drawRect(Skia.XYWHRect(0, v.horizon, v.W, v.H - v.horizon), fill(theme.ground));

  // road
  const far = VIEW_DISTANCE;
  const near = -2.5;
  const road = Skia.PathBuilder.Make();
  road.moveTo(laneX(v, -1.6, far), groundY(v, far));
  road.lineTo(laneX(v, 1.6, far), groundY(v, far));
  road.lineTo(laneX(v, 1.6, near), groundY(v, near));
  road.lineTo(laneX(v, -1.6, near), groundY(v, near));
  road.close();
  canvas.drawPath(road.build(), fill(theme.road));
  for (const side of [-1.6, 1.6]) {
    const edge = Skia.PathBuilder.Make();
    edge.moveTo(laneX(v, side, far), groundY(v, far));
    edge.lineTo(laneX(v, side, near), groundY(v, near));
    canvas.drawPath(edge.build(), stroke(theme.roadEdge, 4));
  }
  if (s.config.mode === 'risk') {
    // Risk Lanes: each lane is tinted by its risk level (a ladder you can see), labelled near Kip.
    ([-1, 0, 1] as const).forEach((lane) => {
      const tier = lane === -1 ? 'safe' : lane === 0 ? 'balanced' : 'wild';
      const strip = Skia.PathBuilder.Make();
      strip.moveTo(laneX(v, lane - 0.5, far), groundY(v, far));
      strip.lineTo(laneX(v, lane + 0.5, far), groundY(v, far));
      strip.lineTo(laneX(v, lane + 0.5, near), groundY(v, near));
      strip.lineTo(laneX(v, lane - 0.5, near), groundY(v, near));
      strip.close();
      canvas.drawPath(strip.build(), fill(RISK_COLORS[tier], 0.14));
    });
  }
  if (s.config.mode === 'timeframe') {
    // Time Tracks: the road takes the colour of the current speed.
    const color = TF_INFO[tfStageAt(s.time, s.config.durationSec)].color;
    const strip = Skia.PathBuilder.Make();
    strip.moveTo(laneX(v, -1.5, far), groundY(v, far));
    strip.lineTo(laneX(v, 1.5, far), groundY(v, far));
    strip.lineTo(laneX(v, 1.5, near), groundY(v, near));
    strip.lineTo(laneX(v, -1.5, near), groundY(v, near));
    strip.close();
    canvas.drawPath(strip.build(), fill(color, 0.12));
  }
  // lane dashes scroll with distance
  const offset = s.distance % 5;
  for (let z = far - offset; z > near; z -= 5) {
    for (const lane of [-0.5, 0.5]) {
      const z2 = z - 1.8;
      const w1 = 0.04 * v.unit * sOf(z);
      const w2 = 0.04 * v.unit * sOf(z2);
      const dash = Skia.PathBuilder.Make();
      dash.moveTo(laneX(v, lane, z) - w1, groundY(v, z));
      dash.lineTo(laneX(v, lane, z) + w1, groundY(v, z));
      dash.lineTo(laneX(v, lane, z2) + w2, groundY(v, z2));
      dash.lineTo(laneX(v, lane, z2) - w2, groundY(v, z2));
      dash.close();
      canvas.drawPath(dash.build(), fill(theme.dash, 0.9));
    }
  }
  if (s.config.mode === 'risk') {
    // Lane labels on white pills, drawn over the lane dashes so they stay readable.
    ([-1, 0, 1] as const).forEach((lane) => {
      const tier = lane === -1 ? 'safe' : lane === 0 ? 'balanced' : 'wild';
      const text = RISK_LABELS[tier];
      const scale = v.unit / 300;
      const w = font.measureText(text).width * scale;
      const x = laneX(v, lane, 3.2);
      const y = groundY(v, 3.2) - 0.02 * v.unit;
      const h = 34 * scale;
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2 - 6, y - h * 0.85, w + 12, h * 1.15), 8, 8), fill('#FFFFFF', 0.9));
      label(canvas, font, text, x, y, scale, RISK_COLORS[tier]);
    });
  }
  // roadside props: market stalls or pine trees (only without the painted backdrop, which already sets the scene)
  const propOffset = s.distance % 9;
  for (let z = far - propOffset, i = Math.floor(s.distance / 9); !sprites.sky && z > near; z -= 9, i++) {
    const sc = sOf(z);
    for (const side of [-2.25, 2.25]) {
      const px = laneX(v, side, z);
      const py = groundY(v, z);
      const u = v.unit * sc;
      const c = theme.prop[(i + (side > 0 ? 1 : 0)) % theme.prop.length];
      if (s.config.mode === 'snowball') {
        const tree = Skia.PathBuilder.Make();
        tree.moveTo(px - 0.35 * u, py);
        tree.lineTo(px + 0.35 * u, py);
        tree.lineTo(px, py - 1.2 * u);
        tree.close();
        canvas.drawPath(tree.build(), fill(c));
        canvas.drawCircle(px, py - 1.15 * u, 0.12 * u, fill('#FFFFFF'));
      } else {
        canvas.drawRect(Skia.XYWHRect(px - 0.35 * u, py - 0.7 * u, 0.7 * u, 0.7 * u), fill('#FFF3DE'));
        canvas.drawRect(Skia.XYWHRect(px - 0.42 * u, py - 0.95 * u, 0.84 * u, 0.28 * u), fill(c));
      }
    }
  }

  // entities back to front, then Kip, then anything in front of Kip; Dash (his Hot Tip cameo and/or
  // an overtake) slots in by depth
  const sorted = s.entities.filter((e) => !e.done || e.z < 0).sort((a, b) => b.z - a.z);
  const cameo = dashCameo(s, sprites);
  const passZ = overtakeZ(s);
  const dashes: { z: number; draw: () => void }[] = [];
  if (cameo) dashes.push({ z: cameo.z, draw: () => drawDash(canvas, v, s, sprites, cameo) });
  if (passZ !== null) dashes.push({ z: passZ, draw: () => drawOvertake(canvas, v, s, sprites, passZ) });
  dashes.sort((a, b) => b.z - a.z);
  const dashBefore = (z: number) => {
    while (dashes.length && dashes[0].z > z) dashes.shift()!.draw();
  };
  const ask = s.ask && s.ask.phase !== 'coming' ? s.ask : null;
  const guideOf = (e: Entity): GateGuide => {
    if (!ask || e.kind !== 'answer' || e.questionId !== ask.questionId) return null;
    if (ask.phase === 'asking') return 'pick';
    return e.correct ? 'right' : 'other';
  };
  for (const e of sorted) {
    if (e.z < 0.3 || e.done) continue;
    dashBefore(e.z);
    drawEntity(canvas, v, e, s.time, font, sprites, guideOf(e));
  }
  dashBefore(0);
  drawKip(canvas, v, s, t, sprites);
  for (const e of sorted) {
    if (e.z >= 0.3 || e.done) continue;
    dashBefore(e.z);
    drawEntity(canvas, v, e, s.time, font, sprites);
  }
  dashBefore(-Infinity);

  drawMelt(canvas, v, s, t, sprites);
}
