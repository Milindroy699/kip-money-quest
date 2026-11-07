/**
 * Where each building's sprite and name label sit on the map, in screen widths. Pure, so the
 * "nothing overlaps" rule is unit-tested against the real sprite shapes.
 *
 * A sprite stands on the road: its bottom edge (the front of its round base) is just below the
 * place's door, where Kip stops. Taller sprites simply reach higher. The name label sits on top.
 */
import { doorOf, type Place } from './map';

export const SPRITE_W = { world: 0.32, spot: 0.22, gate: 0.3 } as const;
/** Label height and (typical) width. */
export const LABEL_H = { world: 0.1, spot: 0.062, gate: 0.1 } as const;
export const LABEL_W = { world: 0.36, spot: 0.26, gate: 0.36 } as const;

export interface PlaceBox {
  /** Centre x. */
  x: number;
  w: number;
  h: number;
  /** Sprite top and bottom. */
  top: number;
  bottom: number;
  /** Top of the label above the sprite. */
  labelTop: number;
}

export function placeBox(p: Place, aspect: number): PlaceBox {
  const w = SPRITE_W[p.kind];
  const h = w / aspect;
  const bottom = doorOf(p).y + 0.015;
  const top = bottom - h;
  return { x: p.x, w, h, top, bottom, labelTop: top - LABEL_H[p.kind] };
}
