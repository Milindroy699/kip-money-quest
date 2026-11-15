/**
 * The Future You plan fills in as the player learns: each world unlocks a piece of their own plan.
 */
import { pathFor, WORLDS, type Track } from '../content';

export interface PlanUnlocks {
  /** World 1 (The Melt) complete: the goal's price after inflation. */
  priceAtGoal: boolean;
  /** "SIP: investing on autopilot" complete: the monthly amount. */
  monthly: boolean;
  /** World 2 complete (end of Season 1): the product choice and the mini Launch Plan. */
  launchPlan: boolean;
  /** World 3 (Risk Ridge) complete: a risk mix for the goal. */
  riskMix: boolean;
}

/** Season 1 is Worlds 0–2; World 3 opens Season 2. */
export const SEASON_1_WORLDS = ['w0', 'w1', 'w2'];
/** The lesson whose reward screen celebrates the end of Season 1. */
export const SEASON_1_FINALE = WORLDS.find((w) => w.id === 'w2')?.lessons.at(-1)?.id ?? 'w2-l6';

const worldDone = (worldId: string, completed: Record<string, unknown>) =>
  (WORLDS.find((w) => w.id === worldId)?.lessons ?? []).every((l) => completed[l.id]);

export function planUnlocks(completed: Record<string, unknown>): PlanUnlocks {
  return {
    priceAtGoal: worldDone('w1', completed),
    monthly: !!completed['w2-l3'],
    launchPlan: worldDone('w2', completed),
    riskMix: worldDone('w3', completed),
  };
}

/** True once every lesson in Season 1 (Worlds 0–2) is finished. */
export function seasonComplete(completed: Record<string, unknown>): boolean {
  return SEASON_1_WORLDS.every((id) => worldDone(id, completed));
}

/** True once every lesson on the player's track is finished. */
export function allContentComplete(completed: Record<string, unknown>, track: Track = 'builder'): boolean {
  return pathFor(track).every((l) => completed[l.id]);
}
