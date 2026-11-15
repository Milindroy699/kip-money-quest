import { autopilot, createRun, step, summarise, type RunMode } from '../../game/runner/engine';
import { createSurf, stepSurf, surfAutopilot, surfResult } from '../../games/chartSurfer';
import { migrateGameState } from '../../state/migrations';
import { useGame } from '../../state/game';
import {
  ACTIVITY_MINUTES,
  dailyGoalProgress,
  lessonCoins,
  REPLAY_XP_DAILY_CAP,
  COMEBACK_BONUS,
  replayLessonXp,
  REWARDED_RUNS_PER_DAY,
  RUN_COIN_CAP,
  runWalletCoins,
} from '../rewards';
import { FREEZE_COST } from '../streak';

// MMKV is native; use an in-memory store in tests (jest.mock is hoisted above the imports).
jest.mock('../../state/storage', () => {
  const mem = new Map<string, string>();
  return {
    mmkvStorage: {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    },
  };
});

function medianWalletCoins(mode: RunMode, durationSec: number) {
  const coins: number[] = [];
  for (let seed = 1; seed <= 25; seed++) {
    const s = createRun({ mode, durationSec, seed });
    let guard = 0;
    while (!s.over && guard++ < 20000) {
      autopilot(s);
      step(s, 1 / 60);
    }
    coins.push(runWalletCoins(summarise(s).coinsAwarded, mode));
  }
  coins.sort((a, b) => a - b);
  return coins[12];
}

describe('economy balance', () => {
  it('all runner modes pay about the same per minute, within the cap', () => {
    const inflation = medianWalletCoins('inflation', 45);
    for (const mode of ['snowball', 'risk', 'timeframe'] as RunMode[]) {
      const other = medianWalletCoins(mode, 45);
      expect(other).toBeLessThanOrEqual(RUN_COIN_CAP);
      expect(Math.abs(inflation - other) / Math.max(inflation, other)).toBeLessThan(0.3);
    }
    expect(inflation).toBeLessThanOrEqual(RUN_COIN_CAP);
  });

  it('Chart Surfer pays like a run: a good surf earns close to the cap, never more', () => {
    const coins: number[] = [];
    for (let seed = 1; seed <= 15; seed++) {
      const s = createSurf(seed);
      let guard = 0;
      while (!s.over && guard++ < 20000) {
        surfAutopilot(s);
        stepSurf(s, 1 / 60);
      }
      coins.push(runWalletCoins(surfResult(s).score, 'chart'));
    }
    coins.sort((a, b) => a - b);
    expect(coins[7]).toBeLessThanOrEqual(RUN_COIN_CAP);
    expect(coins[7]).toBeGreaterThanOrEqual(15);
  });

  it('an emergency-fund freeze takes several days of steady play to afford', () => {
    const steadyDay = lessonCoins({ correct: 2, total: 2 }) + medianWalletCoins('inflation', 45) + 5; // lesson + run + review
    expect(FREEZE_COST / steadyDay).toBeGreaterThanOrEqual(4);
    expect(FREEZE_COST / steadyDay).toBeLessThanOrEqual(7);
  });

  it('replayed lessons earn half XP, capped per day', () => {
    expect(replayLessonXp(40, 0)).toBe(20);
    expect(replayLessonXp(40, REPLAY_XP_DAILY_CAP - 5)).toBe(5);
    expect(replayLessonXp(40, REPLAY_XP_DAILY_CAP)).toBe(0);
  });

  it('daily goal progress fills and caps at 100%', () => {
    expect(dailyGoalProgress(ACTIVITY_MINUTES.lesson, 5)).toBeCloseTo(0.6, 6);
    expect(dailyGoalProgress(12, 10)).toBe(1);
  });
});

describe('saved-progress migration', () => {
  it('upgrades v1 saves without losing progress', () => {
    const v1 = { coins: 120, runs: { count: 4, bestCoins: 88 }, profile: { name: 'Aarav', onboarded: true } };
    const v2 = migrateGameState(v1, 1);
    expect(v2.coins).toBe(120);
    expect(v2.runs).toEqual({ count: 4, bestScore: 88, dashDodged: 0 });
    expect(v2.profile).toEqual({ name: 'Aarav', onboarded: true, runnerButtons: false, age: null, goalPrice: null, loadout: 'cash', soundOn: true, musicOn: true });
    expect(v2.daily).toEqual({ day: '', runs: 0, minutes: 0, replayXp: 0 });
  });

  it('upgrades v2 saves: derives age from the band and adds new settings', () => {
    const v3 = migrateGameState({ profile: { name: 'Riya', ageBand: '16-19', runnerButtons: true } }, 2);
    expect(v3.profile).toEqual({ name: 'Riya', ageBand: '16-19', runnerButtons: true, age: 17, goalPrice: null, loadout: 'cash', soundOn: true, musicOn: true });
  });

  it('upgrades v3 saves: starts Dash dodges at zero and keeps run records', () => {
    const v4 = migrateGameState({ runs: { count: 9, bestScore: 140 } }, 3);
    expect(v4.runs).toEqual({ count: 9, bestScore: 140, dashDodged: 0 });
  });

  it('upgrades v4 saves: no account yet, and the save prompt has never been shown', () => {
    const v5 = migrateGameState({ coins: 50 }, 4);
    expect(v5.coins).toBe(50);
    expect(v5.account).toBeNull();
    expect(v5.savePrompt).toEqual({ offers: 0, lastDay: null, lessonsAtLast: 0 });
  });

  it('upgrades v5 saves: an empty Practice Portfolio', () => {
    const v6 = migrateGameState({ coins: 80 }, 5);
    expect(v6.portfolio).toEqual({ lots: [], settledMonth: null, history: [], nextId: 1 });
  });

  it('upgrades v6 saves: league tier 0 and no duels yet', () => {
    const v7 = migrateGameState({ coins: 10 }, 6);
    expect(v7.social).toEqual({ tier: 0, tierSettledWeek: null, duels: { played: 0, won: 0, day: null, rewardedToday: 0 } });
  });

  it('duels count as play, pay coins for the first few a day, then XP only', () => {
    const g = () => useGame.getState();
    const first = g().completeDuel('win');
    expect(first.coins).toBeGreaterThan(0);
    expect(g().streak.count).toBe(1);
    g().completeDuel('lose');
    g().completeDuel('lose');
    const fourth = g().completeDuel('win');
    expect(fourth.coins).toBe(0);
    expect(fourth.practice).toBe(true);
    expect(g().social.duels).toMatchObject({ played: 4, won: 2 });
  });

  it('investing moves coins out of the wallet, and withdrawing brings them back', () => {
    const g = () => useGame.getState();
    useGame.setState({ coins: 300, cards: ['cash', 'fd', 'indexFund'] });
    expect(g().investCoins('fd', 100)).toBeNull();
    expect(g().coins).toBe(200);
    expect(g().investCoins('stock', 50)).toBe('notUnlocked');
    for (let i = 0; i < 13; i++) g().advanceDay();
    g().settlePortfolio();
    const lot = g().portfolio.lots[0];
    expect(lot.value).toBeGreaterThan(100);
    const payout = g().withdrawLot(lot.id);
    expect(payout).toBeGreaterThan(100);
    expect(g().coins).toBe(200 + (payout as number));
  });
});

describe('store rewards', () => {
  const fakeRun = (score: number) => ({
    mode: 'inflation' as const,
    outcome: 'finished' as const,
    banked: score,
    pocketLeft: 0,
    meltEaten: 0,
    gatesHit: 3,
    gatesSeen: 3,
    consistency: 1,
    multiplier: 2,
    coinsAwarded: score,
    coinsCollected: score,
    hits: 0,
    cashOuts: 0,
    distance: 500,
    answersRight: 0,
    answersWrong: 0,
    shieldsUsed: 0,
    loadoutMultiplier: 1,
    dashDodged: 0,
  });

  beforeEach(() => useGame.getState().resetAll());

  it('pays coins for the first rewarded runs of the day, then treats runs as practice', () => {
    const rewards = Array.from({ length: REWARDED_RUNS_PER_DAY + 1 }, () => useGame.getState().completeRun(fakeRun(400)));
    expect(rewards.slice(0, REWARDED_RUNS_PER_DAY).every((r) => r.coins === RUN_COIN_CAP && !r.practice)).toBe(true);
    expect(rewards[REWARDED_RUNS_PER_DAY].coins).toBe(0);
    expect(rewards[REWARDED_RUNS_PER_DAY].practice).toBe(true);
    expect(useGame.getState().dailyToday().minutes).toBe((REWARDED_RUNS_PER_DAY + 1) * ACTIVITY_MINUTES.run);
  });

  it('autopilot runs never pay coins', () => {
    const r = useGame.getState().completeRun(fakeRun(400), { autopilot: true });
    expect(r.coins).toBe(0);
    expect(r.practice).toBe(true);
  });

  it('tracks a personal best score', () => {
    useGame.getState().completeRun(fakeRun(100));
    const r = useGame.getState().completeRun(fakeRun(150));
    expect(r.newBest).toBe(true);
    expect(useGame.getState().runs.bestScore).toBe(150);
  });

  it('replaying a lesson pays no coins and capped XP', () => {
    const outcome = { correct: 2, total: 2 };
    const first = useGame.getState().completeLesson('w0-l1', outcome);
    expect(first.coins).toBe(lessonCoins(outcome));
    let total = 0;
    for (let i = 0; i < 6; i++) {
      const r = useGame.getState().completeLesson('w0-l1', outcome);
      expect(r.replay).toBe(true);
      expect(r.coins).toBe(0);
      total += r.xp;
    }
    expect(total).toBeLessThanOrEqual(REPLAY_XP_DAILY_CAP);
  });

  it('pays a one-off welcome-back bonus after 3+ days away, never after a short gap', () => {
    const outcome = { correct: 2, total: 2 };
    const g = () => useGame.getState();
    expect(g().completeLesson('w0-l1', outcome).comeback).toBeUndefined(); // first ever: no bonus
    for (let i = 0; i < 2; i++) g().advanceDay();
    expect(g().completeLesson('w0-l2', outcome).comeback).toBeUndefined(); // 2 days: no bonus
    for (let i = 0; i < 4; i++) g().advanceDay();
    const back = g().completeLesson('w0-l3', outcome);
    expect(back.comeback).toBe(COMEBACK_BONUS);
    expect(back.coins).toBe(lessonCoins(outcome) + COMEBACK_BONUS);
    expect(g().completeLesson('w0-l4', outcome).comeback).toBeUndefined(); // same day: only once
  });
});
