/**
 * The two looks of the map. Same layout and rules; only names, colours and art differ.
 * Builder (16 and up, adults included) gets a university campus; Explorer (13–15) gets an adventure island.
 * Art prompts for both: docs/prompts/campus-art.md.
 */
import type { Track } from '../content';
import type { SpotId } from './map';

export type SkinId = 'campus' | 'island';

export interface PlaceCopy {
  name: string;
  emoji: string;
}

export interface Skin {
  id: SkinId;
  /** Map title, e.g. "Kip Campus". */
  title: string;
  /** Label under the hero button in the tab bar. */
  tabLabel: string;
  gate: PlaceCopy & { text: string };
  places: Record<string, PlaceCopy>;
  spots: Record<SpotId, PlaceCopy & { activity: string; blurb: string }>;
  ground: { top: string; bottom: string; patch: string; edge: string | null };
  road: { edge: string; fill: string; dash: string | null };
  trees: { canopy: string[]; trunk: string };
}

const SPOT_ACTIVITY: Record<SpotId, { activity: string; blurb: string }> = {
  track: { activity: 'Kip Run', blurb: 'Outrun The Melt and earn coins. New modes open as you learn.' },
  library: { activity: 'Reviews & Quiz', blurb: 'Review lessons you finished, and quiz yourself or a friend so the ideas stick.' },
  bank: { activity: 'Dividend Day', blurb: 'A weekly reward that grows with your streak.' },
  lab: { activity: 'Practice Portfolio', blurb: 'Invest your coins. 1 day here = 1 month in the market.' },
  arena: { activity: 'Market Duel', blurb: 'Build a 5-card portfolio and take on Dash or a friend.' },
};

const withActivity = (copy: Record<SpotId, PlaceCopy>) =>
  Object.fromEntries(Object.entries(copy).map(([id, c]) => [id, { ...c, ...SPOT_ACTIVITY[id as SpotId] }])) as Skin['spots'];

export const SKINS: Record<SkinId, Skin> = {
  campus: {
    id: 'campus',
    title: 'Kip Campus',
    tabLabel: 'Campus',
    gate: { name: 'Money Town Gate', emoji: '🏛️', text: 'Money Town is where it starts: what money is and why it moves. Every building past the gate teaches one big money idea.' },
    places: {
      w0: { name: 'Money Town', emoji: '🏛️' },
      w1: { name: 'Melt Lab', emoji: '🧪' },
      w2: { name: 'Snow Dome', emoji: '❄️' },
      w3: { name: 'Climbing Wall', emoji: '🧗' },
      w4: { name: 'Campus Bazaar', emoji: '🛍️' },
      w5: { name: 'Fort Hall', emoji: '🏰' },
      w6: { name: 'Debate Hall', emoji: '🚪' },
      w7: { name: 'Clock Tower', emoji: '⏱️' },
      w8: { name: 'Analyst HQ', emoji: '📊' },
      w9: { name: 'Convocation Hall', emoji: '🎓' },
    },
    spots: withActivity({
      track: { name: 'Sports Ground', emoji: '🏃' },
      library: { name: 'Library', emoji: '📚' },
      bank: { name: 'Campus Bank', emoji: '💰' },
      lab: { name: 'Trading Lab', emoji: '📈' },
      arena: { name: 'Duel Arena', emoji: '⚔️' },
    }),
    ground: { top: '#CDE9B4', bottom: '#A8D98E', patch: '#B9E2A0', edge: null },
    road: { edge: '#C79E6E', fill: '#F4DEB6', dash: 'rgba(255,255,255,0.8)' },
    trees: { canopy: ['#5DB86A', '#4FA65E', '#7CC66F', '#E9773A'], trunk: '#8A5A3B' },
  },
  island: {
    id: 'island',
    title: 'Quest Island',
    tabLabel: 'Quest',
    gate: { name: 'Money Town Dock', emoji: '⛵', text: 'Money Town is where it starts: what money is and why it moves. Each stop on the island teaches one big money idea.' },
    places: {
      w0: { name: 'Money Town', emoji: '⛵' },
      w1: { name: 'Melt Marsh', emoji: '🫧' },
      w2: { name: 'Snowball Peak', emoji: '🏔️' },
      w3: { name: 'Risk Ridge', emoji: '🧗' },
      w4: { name: 'Bazaar Harbour', emoji: '⚓' },
      w5: { name: 'Fort Rock', emoji: '🏰' },
      w6: { name: 'Three Doors Cave', emoji: '🚪' },
      w7: { name: 'Clockwork Falls', emoji: '⏱️' },
      w8: { name: 'Observatory', emoji: '🔭' },
      w9: { name: 'Future Lighthouse', emoji: '🗼' },
    },
    spots: withActivity({
      track: { name: 'Race Beach', emoji: '🏃' },
      library: { name: 'Treehouse Library', emoji: '📚' },
      bank: { name: 'Treasure Cove', emoji: '💰' },
      lab: { name: 'Market Stall', emoji: '📈' },
      arena: { name: 'Duel Ring', emoji: '⚔️' },
    }),
    ground: { top: '#BFE7A8', bottom: '#9FD889', patch: '#F2DFAE', edge: '#7FD3E6' },
    road: { edge: '#D6B172', fill: '#F7E6BC', dash: null },
    trees: { canopy: ['#3FAE6B', '#55C27A', '#2E9A5C', '#6FCB86'], trunk: '#9A6B42' },
  },
};

export function skinFor(track: Track): Skin {
  return SKINS[track === 'builder' ? 'campus' : 'island'];
}
