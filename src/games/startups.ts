/**
 * Backing startups (World 9, PE/VC): most fail, a few return a lot (the power law). Backing many
 * small bets is the only way the big winners show up, and the money is locked for years.
 */
import { createRng } from '../sim/rng';

/** One startup's outcome as a multiple of the money put in. */
function outcome(r: number): number {
  if (r < 0.6) return 0; // fails
  if (r < 0.85) return 1; // gives the money back
  if (r < 0.96) return 3; // solid
  return 25; // a big winner
}

/** For a fund backing `n` equal-sized startups: chance of losing money, and the typical multiple. */
export function startupOdds(n: number, funds = 2000): { lossChance: number; median: number } {
  const rng = createRng(777 + n);
  const results: number[] = [];
  for (let f = 0; f < funds; f++) {
    let total = 0;
    for (let i = 0; i < n; i++) total += outcome(rng());
    results.push(total / n);
  }
  results.sort((a, b) => a - b);
  return { lossChance: results.filter((x) => x < 1).length / funds, median: results[Math.floor(funds / 2)] };
}
