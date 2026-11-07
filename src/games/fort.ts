/**
 * Fort Defense (World 5): place 5 towers (asset chips), then survive waves of market monsters.
 * Each tower helps against some monsters and suffers against others; only a mixed fort survives
 * reliably and still grows. After each wave you may move one chip: rebalancing.
 */
import { createRng, type Rng } from '../sim/rng';

export type Tower = 'shares' | 'bonds' | 'gold' | 'cash' | 'hedge';
export type Wave = 'crash' | 'inflation' | 'rates' | 'bills' | 'boom' | 'calm';

export const TOWERS: Record<Tower, { emoji: string; name: string; growth: number; note: string }> = {
  shares: { emoji: '📈', name: 'Shares tower', growth: 8, note: 'Grows fastest. Crash Goblins hit it hard.' },
  bonds: { emoji: '📜', name: 'Bond wall', growth: 3, note: 'Steady. Rate-Hike Golems dent it.' },
  gold: { emoji: '🥇', name: 'Gold keep', growth: 2, note: 'Slow, but beats Inflation Fog and shines in crashes.' },
  cash: { emoji: '🧱', name: 'Cash gate', growth: 0, note: 'Blocks Surprise-Bill Bats. Melts a little in Inflation Fog.' },
  hedge: { emoji: '🛡️', name: 'Hedge shield', growth: -2, note: 'Costs a little every wave; halves crash damage.' },
};

export const WAVES: Record<Wave, { emoji: string; name: string; text: string }> = {
  crash: { emoji: '👺', name: 'Crash Goblins', text: 'Share prices tumble.' },
  inflation: { emoji: '🌫️', name: 'Inflation Fog', text: 'Prices rise. Idle cash melts.' },
  rates: { emoji: '🗿', name: 'Rate-Hike Golems', text: 'Interest rates jump. Bond prices dip.' },
  bills: { emoji: '🦇', name: 'Surprise-Bill Bats', text: 'A big bill arrives. Who can pay it?' },
  boom: { emoji: '🎆', name: 'Boom Festival', text: 'Markets rally. Shares soar.' },
  calm: { emoji: '🌤️', name: 'Calm Day', text: 'Nothing dramatic. Compounding works quietly.' },
};

export type Fort = Record<Tower, number>;
export const emptyFort = (): Fort => ({ shares: 0, bonds: 0, gold: 0, cash: 0, hedge: 0 });
export const SLOTS = 5;
export const START_HP = 100;
export const fortSize = (f: Fort) => Object.values(f).reduce((s, n) => s + n, 0);

export function waveList(seed: number, count: number): Wave[] {
  const rng: Rng = createRng(seed);
  const table: [Wave, number][] = [['crash', 0.25], ['inflation', 0.2], ['rates', 0.2], ['bills', 0.15], ['boom', 0.1], ['calm', 0.1]];
  return Array.from({ length: count }, () => {
    let r = rng();
    for (const [w, p] of table) {
      if (r < p) return w;
      r -= p;
    }
    return 'calm';
  });
}

export interface WaveResult {
  damage: number;
  growth: number;
  lines: string[];
}

export function resolveWave(f: Fort, wave: Wave): WaveResult {
  const lines: string[] = [];
  let damage = 0;
  let growth = (Object.keys(TOWERS) as Tower[]).reduce((g, t) => g + TOWERS[t].growth * f[t], 0);
  switch (wave) {
    case 'crash': {
      const hit = 15 * f.shares * (f.hedge > 0 ? 0.5 : 1);
      damage = Math.max(hit - 2 * f.gold, 0);
      if (f.shares) lines.push(`Goblins smash your shares tower${f.hedge ? ', but the hedge shield halves it' : ''}.`);
      if (f.gold) lines.push('Your gold keep holds firm and patches the walls.');
      if (!f.shares) lines.push('No shares to smash. Safe, but slow.');
      break;
    }
    case 'inflation': {
      damage = Math.max(6 * f.cash + 3 * f.bonds - 5 * f.gold, 0);
      lines.push(f.gold ? 'Gold glows through the fog.' : 'Nothing here fights inflation.');
      if (f.cash) lines.push('Idle cash melts a little.');
      break;
    }
    case 'rates':
      damage = 8 * f.bonds + 3 * f.shares;
      lines.push(f.bonds ? 'Golems dent your bond wall: prices fall when rates rise.' : 'No bonds for the golems to dent.');
      break;
    case 'bills':
      damage = f.cash > 0 ? 0 : 25;
      lines.push(f.cash > 0 ? 'Your cash gate pays the bill. Nothing had to be sold.' : 'No cash! You sold investments in a hurry, at a bad price.');
      break;
    case 'boom':
      growth += 8 * f.shares;
      lines.push(f.shares ? 'Your shares tower soars!' : 'Everyone else’s shares soar. Yours would have too.');
      break;
    case 'calm':
      lines.push('A quiet day. Everything grows a little.');
      break;
  }
  return { damage: Math.round(damage), growth: Math.round(growth), lines };
}

export interface FortRun {
  hp: number;
  growth: number;
  fell: boolean;
  score: number;
}

/** Plays every wave with no rebalancing (used by tests and as Kip's comparison). */
export function playFort(f: Fort, waves: Wave[]): FortRun {
  let hp = START_HP;
  let growth = 0;
  for (const w of waves) {
    const r = resolveWave(f, w);
    hp -= r.damage;
    growth += r.growth;
    if (hp <= 0) return { hp: 0, growth, fell: true, score: Math.round(growth / 4) }; // forced to sell at the bottom
  }
  return { hp, growth, fell: false, score: hp + growth };
}
