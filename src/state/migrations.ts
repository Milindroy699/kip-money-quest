/**
 * Saved-progress migrations. Bump STATE_VERSION and add a step whenever the persisted shape
 * changes, so players never lose progress on update.
 */
export const STATE_VERSION = 7;

export interface DailyTally {
  day: string;
  /** Runs played today (rewarded and practice). */
  runs: number;
  /** Estimated minutes of learning today, for the daily-goal ring. */
  minutes: number;
  /** XP already earned today from replaying finished lessons. */
  replayXp: number;
  /** Quiz Battles finished today (the first one earns coins). */
  quizzes?: number;
}

export const emptyDaily: DailyTally = { day: '', runs: 0, minutes: 0, replayXp: 0 };

type Persisted = Record<string, any>;

export function migrateGameState(persisted: unknown, fromVersion: number): Persisted {
  const s: Persisted = { ...((persisted as Persisted) ?? {}) };
  if (fromVersion < 2) {
    // v2: runs.bestCoins → runs.bestScore, daily tally, runner-button setting.
    const runs = s.runs ?? {};
    s.runs = { count: runs.count ?? 0, bestScore: runs.bestScore ?? runs.bestCoins ?? 0 };
    s.daily = s.daily ?? { ...emptyDaily };
    s.profile = { ...(s.profile ?? {}), runnerButtons: s.profile?.runnerButtons ?? false };
  }
  if (fromVersion < 3) {
    // v3: exact age (from the age band), goal price, run loadout, sound settings.
    const p = s.profile ?? {};
    s.profile = {
      ...p,
      age: p.age ?? (p.ageBand === '16-19' ? 17 : p.ageBand === '13-15' ? 14 : null),
      goalPrice: p.goalPrice ?? null,
      loadout: p.loadout ?? 'cash',
      soundOn: p.soundOn ?? true,
      musicOn: p.musicOn ?? true,
    };
  }
  if (fromVersion < 4) {
    // v4: lifetime Dash dodges (sets his difficulty tier).
    const runs = s.runs ?? {};
    s.runs = { count: runs.count ?? 0, bestScore: runs.bestScore ?? 0, dashDodged: runs.dashDodged ?? 0 };
  }
  if (fromVersion < 5) {
    // v5: accounts (sign-in to save progress) and the save-prompt back-off.
    s.account = s.account ?? null;
    s.savePrompt = s.savePrompt ?? { offers: 0, lastDay: null, lessonsAtLast: 0 };
  }
  if (fromVersion < 6) {
    // v6: Practice Portfolio.
    s.portfolio = s.portfolio ?? { lots: [], settledMonth: null, history: [], nextId: 1 };
  }
  if (fromVersion < 7) {
    // v7: leagues and Market Duel.
    s.social = s.social ?? { tier: 0, tierSettledWeek: null, duels: { played: 0, won: 0, day: null, rewardedToday: 0 } };
  }
  return s;
}
