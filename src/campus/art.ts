/**
 * Art for the campus map, by look. The files are cut by scripts/process_campus.py from the
 * originals in design/source-art/Campus (prompts: docs/prompts/campus-art.md) and listed in the
 * generated ./sprites.ts.
 */
import { BUILDING_SPRITES, DECO_SPRITES, type Sprite } from './sprites';
import type { SkinId } from './skins';

export type { Sprite };

/** A building, gate or spot. Closed places show their "under construction" version. */
export function spriteFor(skin: SkinId, placeId: string, closed = false): Sprite | undefined {
  const set: Record<string, Sprite> = BUILDING_SPRITES[skin];
  return (closed ? set[`${placeId}_locked`] : undefined) ?? set[placeId];
}

export type DecoKind = 'tree' | 'prop';

/** Scenery scattered over the map: trees fill the gaps, props (lamps, benches, signs) line the road. */
export const DECO_KINDS: Record<SkinId, { tree: string[]; prop: string[] }> = {
  campus: { tree: ['neem', 'gulmohar', 'banyan'], prop: ['lamp', 'bench', 'chai'] },
  island: { tree: ['palm', 'palms', 'rock'], prop: ['sign', 'bridge', 'campfire'] },
};

/** Width on the map, in screen widths. */
export const DECO_WIDTH: Record<string, number> = {
  neem: 0.15,
  gulmohar: 0.15,
  banyan: 0.17,
  lamp: 0.045,
  bench: 0.12,
  chai: 0.11,
  palm: 0.12,
  palms: 0.14,
  rock: 0.12,
  sign: 0.07,
  bridge: 0.12,
  campfire: 0.1,
};

/** The deco sprites of one look, in a fixed order (trees, then props). */
export function decoList(skin: SkinId): { id: string; sprite: Sprite }[] {
  const set: Record<string, Sprite> = DECO_SPRITES[skin];
  const { tree, prop } = DECO_KINDS[skin];
  return [...tree, ...prop].map((id) => ({ id, sprite: set[id] }));
}
