/**
 * Which way Kip faces while he walks the map. Pure, so it can be unit-tested.
 *
 * The Veo walk clips come in three views: up (three-quarter back, heading right), down (front,
 * turned slightly right) and side (heading right). Heading left mirrors them.
 */
import type { Pt } from './map';

export type Facing = { view: 'up' | 'down' | 'side'; mirror: boolean };

/** Facing for a step of (dx, dy) on the map; y grows downwards. Mostly sideways steps use the side view. */
export function facingFor(dx: number, dy: number): Facing {
  const mirror = dx < 0;
  if (Math.abs(dx) > 1.6 * Math.abs(dy)) return { view: 'side', mirror };
  return { view: dy < 0 ? 'up' : 'down', mirror };
}

/**
 * Where the facing changes along a walk, as [progress 0–1, facing] pairs, with progress
 * spread evenly over the points (as the walk animation interpolates them). Each step looks a few
 * points ahead so a wiggle in the road doesn't flip Kip back and forth.
 */
export function facingSchedule(pts: Pt[], lookAhead = 3): { at: number; facing: Facing }[] {
  const out: { at: number; facing: Facing }[] = [];
  const n = pts.length;
  if (n < 2) return out;
  for (let i = 0; i < n - 1; i++) {
    const j = Math.min(n - 1, i + lookAhead);
    const f = facingFor(pts[j].x - pts[i].x, pts[j].y - pts[i].y);
    const last = out[out.length - 1]?.facing;
    if (!last || last.view !== f.view || last.mirror !== f.mirror) out.push({ at: i / (n - 1), facing: f });
  }
  return out;
}

/** The facing in effect at a given progress. */
export function facingAt(schedule: { at: number; facing: Facing }[], progress: number): Facing | undefined {
  let f = schedule[0]?.facing;
  for (const s of schedule) {
    if (s.at <= progress) f = s.facing;
    else break;
  }
  return f;
}

/** The walk's easing (quadratic in-out, matching Easing.inOut(Easing.quad)): time fraction → progress. */
export function walkEase(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** Inverse of walkEase: progress → time fraction. */
export function walkEaseInverse(p: number): number {
  const q = Math.min(1, Math.max(0, p));
  return q < 0.5 ? Math.sqrt(q / 2) : 1 - Math.sqrt((1 - q) * 2) / 2;
}

/** When (ms after the walk starts) each facing in the schedule begins. */
export function facingTimes(schedule: { at: number; facing: Facing }[], durationMs: number): { ms: number; facing: Facing }[] {
  return schedule.map((s) => ({ ms: Math.round(walkEaseInverse(s.at) * durationMs), facing: s.facing }));
}

