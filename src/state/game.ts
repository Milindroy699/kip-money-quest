/**
 * The single on-device game store. All rules live in src/engagement and src/sim; this file
 * only wires them to persisted state. Phase 2 syncs this to Firebase.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getLesson, STARTER_CARDS } from '../content';
import { addDays, dayKey, weekday, type DayKey } from '../engagement/days';
import { markReviewed, type ReviewRecord } from '../engagement/review';
import {
  ACTIVITY_MINUTES,
  canClaimDividend,
  comebackBonus,
  DUEL_REWARD,
  REWARDED_DUELS_PER_DAY,
  computeFinIQ,
  dividendAmount,
  lessonCoins,
  lessonXp,
  PRACTICE_RUN_XP,
  QUIZ_FIRST_COINS,
  quizXp,
  replayLessonXp,
  REWARDED_RUNS_PER_DAY,
  reviewXp,
  runWalletCoins,
  runXp,
  type LessonOutcome,
  type RUN_COIN_DIVISOR,
} from '../engagement/rewards';
import {
  activeInLast7,
  buyFreeze,
  displayStreak,
  initialStreak,
  recordActivity,
  streakMultiplier,
  type StreakEvent,
  type StreakState,
} from '../engagement/streak';
import { emptySavePrompt, type SavePromptState } from '../account/prime';
import { emptyPortfolio, invest, monthOfDay, settle, withdraw, type InvestError, type PortfolioState } from '../portfolio/engine';
import { emptyDaily, migrateGameState, STATE_VERSION, type DailyTally } from './migrations';
import { mmkvStorage } from './storage';

/** What a game reports to the wallet: Kip Run's RunResult, or Chart Surfer's score. */
export interface RunScore {
  mode: keyof typeof RUN_COIN_DIVISOR;
  coinsAwarded: number;
  dashDodged: number;
}

/**
 * The account progress is saved to. Under 18 it belongs to a parent or guardian, who consented
 * (holder 'parent'). Only what the app needs is kept here; no email addresses.
 */
export interface LinkedAccount {
  provider: 'apple' | 'google';
  uid: string;
  /** The account holder's display name (the parent's, for a parent account). */
  name: string | null;
  holder: 'self' | 'parent';
  /** True when the account lives in Firebase; false = local test account (development only). */
  cloud: boolean;
  /** When consent was given (by the player if 18+, else by the parent). ISO time. */
  consentAt: string;
}

export type GoalId = 'laptop' | 'bike' | 'travel' | 'college' | 'business' | 'free40';
/** '16-19' is the stored value for the Builder track, which is 16 and up (adults too); see src/content/ages.ts. */
export type AgeBand = '13-15' | '16-19';

export interface Profile {
  name: string;
  ageBand: AgeBand | null;
  /** Exact age, used by the Goal Planner (the band is derived from it). */
  age: number | null;
  goal: GoalId | null;
  /** Price of the dream goal in today's rupees (editable; defaults per goal). */
  goalPrice: number | null;
  targetAge: number;
  dailyGoalMin: 3 | 5 | 10;
  reminder: { hour: number; minute: number };
  schoolHoursMute: boolean;
  onboarded: boolean;
  /** Accessibility: show on-screen buttons in Kip Run instead of swipes only. */
  runnerButtons: boolean;
  /** Card equipped for Kip Run. */
  loadout: string;
  soundOn: boolean;
  musicOn: boolean;
}

export interface LessonRecord extends ReviewRecord {
  accuracy: number;
  boss: boolean;
}

export interface Reward {
  xp: number;
  coins: number;
  multiplier: number;
  streakEvent: StreakEvent;
  streak: number;
  finiqBefore: number;
  finiqAfter: number;
  newCards: string[];
  /** Run only: true when the run paid no coins (autopilot, or over today's rewarded-run limit). */
  practice?: boolean;
  /** Run only: true when this run beat the personal best score. */
  newBest?: boolean;
  /** Lesson only: true when this was a replay of a finished lesson. */
  replay?: boolean;
  /** Welcome-back bonus coins (first activity after 3+ days away), already included in `coins`. */
  comeback?: number;
}

export interface GameState {
  profile: Profile;
  streak: StreakState;
  coins: number;
  xp: number;
  weekly: { weekStart: DayKey; xp: number };
  lessons: Record<string, LessonRecord>;
  cards: string[];
  /** dashDodged: Dash traps dodged in your own lane, lifetime (sets his difficulty tier). */
  runs: { count: number; bestScore: number; dashDodged: number };
  daily: DailyTally;
  lastDividendDay: DayKey | null;
  /** Debug only: shifts "today" forward to test streaks and reviews. */
  dayOffset: number;

  today: () => DayKey;
  finIQ: () => number;
  setProfile: (patch: Partial<Profile>) => void;
  grantStarterCards: () => string[];
  completeOnboarding: () => void;
  completeLesson: (id: string, outcome: LessonOutcome) => Reward;
  completeRun: (result: RunScore, opts?: { autopilot?: boolean }) => Reward;
  /** Today's tally (resets automatically on a new day). */
  dailyToday: () => DailyTally;
  completeReview: (ids: string[], correct: number) => Reward;
  /** Quiz Battle: counts toward today's goal and streak; coins only for the first quiz of the day. */
  completeQuiz: (correct: number, total: number, points: number) => Reward;
  /** Quiz Battle history (for nudges and trophies). */
  quiz: { played: number; perfect: number; best: number };
  claimDividend: () => number | null;
  buyStreakFreeze: () => boolean;
  advanceDay: () => void;
  resetAll: () => void;

  account: LinkedAccount | null;
  /** History of "Save your progress" offers, for back-off (see src/account/prime.ts). */
  savePrompt: SavePromptState;
  linkAccount: (account: LinkedAccount) => void;
  unlinkAccount: () => void;
  noteSaveOffered: () => void;

  /** Practice Portfolio (src/portfolio/engine.ts): coins invested in unlocked products. */
  portfolio: PortfolioState;
  /** Applies the market up to today (1 day = 1 market month). */
  settlePortfolio: () => void;
  investCoins: (cardId: string, amount: number) => InvestError | null;
  withdrawLot: (lotId: number) => number | 'locked';

  /** Leagues and Market Duel (src/social, src/duel). */
  social: SocialState;
  completeDuel: (outcome: 'win' | 'draw' | 'lose') => Reward;
  setLeagueTier: (tier: number, settledWeek: DayKey) => void;
}

export interface SocialState {
  /** League tier (0 = Piggy Bank … 5 = Compounder). */
  tier: number;
  /** The week whose result has already moved `tier`. */
  tierSettledWeek: DayKey | null;
  duels: { played: number; won: number; day: DayKey | null; rewardedToday: number };
}

export const initialSocial: SocialState = { tier: 0, tierSettledWeek: null, duels: { played: 0, won: 0, day: null, rewardedToday: 0 } };

const DAY_MS = 86_400_000;

export const initialProfile: Profile = {
  name: '',
  ageBand: null,
  age: null,
  goal: null,
  goalPrice: null,
  targetAge: 25,
  dailyGoalMin: 5,
  reminder: { hour: 18, minute: 0 },
  schoolHoursMute: true,
  onboarded: false,
  runnerButtons: false,
  loadout: 'cash',
  soundOn: true,
  musicOn: true,
};

function weekStartOf(day: DayKey): DayKey {
  return addDays(day, -((weekday(day) + 6) % 7)); // Monday
}

const initialData = {
  profile: initialProfile,
  streak: initialStreak,
  coins: 0,
  xp: 0,
  weekly: { weekStart: '1970-01-05', xp: 0 },
  lessons: {} as Record<string, LessonRecord>,
  cards: [] as string[],
  runs: { count: 0, bestScore: 0, dashDodged: 0 },
  daily: emptyDaily,
  lastDividendDay: null as DayKey | null,
  dayOffset: 0,
  account: null as LinkedAccount | null,
  savePrompt: emptySavePrompt,
  portfolio: emptyPortfolio,
  social: initialSocial,
  quiz: { played: 0, perfect: 0, best: 0 },
};

/** The fields saved on the phone (and backed up to the cloud when signed in). */
export function persistedFields(s: GameState) {
  return {
    profile: s.profile,
    streak: s.streak,
    coins: s.coins,
    xp: s.xp,
    weekly: s.weekly,
    lessons: s.lessons,
    cards: s.cards,
    runs: s.runs,
    daily: s.daily,
    lastDividendDay: s.lastDividendDay,
    dayOffset: s.dayOffset,
    account: s.account,
    savePrompt: s.savePrompt,
    portfolio: s.portfolio,
    social: s.social,
    quiz: s.quiz,
  };
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      /** Records daily activity, applies XP with the streak multiplier, returns the reward. */
      const award = ({
        xp: baseXp,
        coins,
        minutes,
        newCards = [],
        lessonPatch,
        dailyPatch = {},
      }: {
        xp: (multiplier: number) => number;
        coins: number;
        minutes: number;
        newCards?: string[];
        lessonPatch?: Record<string, LessonRecord>;
        dailyPatch?: Partial<DailyTally>;
      }): Reward => {
        const state = get();
        const today = state.today();
        const finiqBefore = state.finIQ();
        const comeback = comebackBonus(state.streak.lastActiveDay, today);
        const update = recordActivity(state.streak, today);
        const multiplier = streakMultiplier(update.state.count);
        const xp = baseXp(multiplier);
        const weekStart = weekStartOf(today);
        const weekly = state.weekly.weekStart === weekStart ? { weekStart, xp: state.weekly.xp + xp } : { weekStart, xp };
        const cards = Array.from(new Set([...state.cards, ...newCards]));
        const daily = state.dailyToday();
        set({
          streak: update.state,
          xp: state.xp + xp,
          coins: state.coins + coins + comeback,
          weekly,
          cards,
          lessons: lessonPatch ? { ...state.lessons, ...lessonPatch } : state.lessons,
          daily: { ...daily, ...dailyPatch, minutes: daily.minutes + minutes },
        });
        return {
          xp,
          coins: coins + comeback,
          comeback: comeback || undefined,
          multiplier,
          streakEvent: update.event,
          streak: update.state.count,
          finiqBefore,
          finiqAfter: get().finIQ(),
          newCards: newCards.filter((c) => !state.cards.includes(c)),
        };
      };

      return {
        ...initialData,

        today: () => dayKey(new Date(Date.now() + get().dayOffset * DAY_MS)),

        dailyToday: () => {
          const today = get().today();
          const d = get().daily ?? emptyDaily;
          return d.day === today ? d : { ...emptyDaily, day: today };
        },

        finIQ: () =>
          computeFinIQ(
            get().profile.onboarded,
            Object.values(get().lessons).map((l) => ({ accuracy: l.accuracy, boss: l.boss })),
          ),

        setProfile: (patch) => set({ profile: { ...get().profile, ...patch } }),

        grantStarterCards: () => {
          const fresh = STARTER_CARDS.filter((c) => !get().cards.includes(c));
          set({ cards: Array.from(new Set([...get().cards, ...STARTER_CARDS])) });
          return fresh;
        },

        completeOnboarding: () => set({ profile: { ...get().profile, onboarded: true } }),

        completeLesson: (id, outcome) => {
          const lesson = getLesson(id);
          const today = get().today();
          const previous = get().lessons[id];
          const accuracy = outcome.total > 0 ? outcome.correct / outcome.total : 1;
          const record: LessonRecord = previous
            ? { ...previous, accuracy: Math.max(previous.accuracy, accuracy) }
            : { completedDay: today, reviewsDone: 0, accuracy, boss: !!outcome.boss };
          const minutes = outcome.boss ? ACTIVITY_MINUTES.bossLesson : ACTIVITY_MINUTES.lesson;
          if (previous) {
            // Replays earn half XP, capped per day, and no coins: no farming coins or league XP.
            const replayXpToday = get().dailyToday().replayXp;
            let granted = 0;
            const reward = award({
              xp: (m) => (granted = replayLessonXp(lessonXp(outcome, m), replayXpToday)),
              coins: 0,
              minutes,
              lessonPatch: { [id]: record },
            });
            set({ daily: { ...get().daily, replayXp: replayXpToday + granted } });
            return { ...reward, replay: true };
          }
          return award({ xp: (m) => lessonXp(outcome, m), coins: lessonCoins(outcome), minutes, newCards: lesson?.unlockCards ?? [], lessonPatch: { [id]: record } });
        },

        completeRun: (result, opts) => {
          const daily = get().dailyToday();
          const rewarded = !opts?.autopilot && daily.runs < REWARDED_RUNS_PER_DAY;
          const coins = rewarded ? runWalletCoins(result.coinsAwarded, result.mode) : 0;
          const previousBest = get().runs.bestScore;
          const newBest = !opts?.autopilot && result.coinsAwarded > previousBest;
          const reward = award({
            xp: (m) => (rewarded ? runXp(coins, m) : PRACTICE_RUN_XP),
            coins,
            minutes: ACTIVITY_MINUTES.run,
            dailyPatch: { runs: daily.runs + 1 },
          });
          const runs = get().runs;
          // Kip's autopilot dodges for you, so only your own dodges make Dash harder.
          const dodged = runs.dashDodged + (opts?.autopilot ? 0 : result.dashDodged);
          set({ runs: { count: runs.count + 1, bestScore: newBest ? result.coinsAwarded : previousBest, dashDodged: dodged } });
          return { ...reward, practice: !rewarded, newBest: newBest && previousBest > 0 };
        },

        completeQuiz: (correct, total, points) => {
          const playedToday = get().dailyToday().quizzes ?? 0;
          const reward = award({ xp: (m) => quizXp(correct, m), coins: playedToday === 0 ? QUIZ_FIRST_COINS : 0, minutes: ACTIVITY_MINUTES.review, dailyPatch: { quizzes: playedToday + 1 } });
          const q = get().quiz ?? { played: 0, perfect: 0, best: 0 };
          set({ quiz: { played: q.played + 1, perfect: q.perfect + (total > 0 && correct === total ? 1 : 0), best: Math.max(q.best, points) } });
          return reward;
        },

        completeReview: (ids, correct) => {
          const today = get().today();
          const patch: Record<string, LessonRecord> = {};
          for (const id of ids) {
            const rec = get().lessons[id];
            if (rec) patch[id] = { ...rec, ...markReviewed(rec, today) };
          }
          return award({ xp: (m) => reviewXp(correct, m), coins: 5, minutes: ACTIVITY_MINUTES.review, lessonPatch: patch });
        },

        claimDividend: () => {
          const { lastDividendDay, streak } = get();
          const today = get().today();
          if (!canClaimDividend(lastDividendDay, today)) return null;
          const amount = dividendAmount(activeInLast7(streak, today), displayStreak(streak, today));
          set({ coins: get().coins + amount, lastDividendDay: today });
          return amount;
        },

        buyStreakFreeze: () => {
          const result = buyFreeze(get().streak, get().coins);
          if (!result.ok) return false;
          set({ streak: result.state, coins: result.coins });
          return true;
        },

        advanceDay: () => set({ dayOffset: get().dayOffset + 1 }),

        resetAll: () => set({ ...initialData }),

        linkAccount: (account) => set({ account }),
        unlinkAccount: () => set({ account: null }),
        settlePortfolio: () => set({ portfolio: settle(get().portfolio, monthOfDay(get().today())) }),
        investCoins: (cardId, amount) => {
          const s = get();
          const result = invest(s.portfolio, cardId, Math.floor(amount), monthOfDay(s.today()), s.coins, s.cards);
          if ('error' in result) return result.error;
          set({ portfolio: result.portfolio, coins: s.coins - result.spent });
          return null;
        },
        withdrawLot: (lotId) => {
          const s = get();
          const result = withdraw(s.portfolio, lotId, monthOfDay(s.today()));
          if ('error' in result) return 'locked';
          set({ portfolio: result.portfolio, coins: s.coins + result.payout });
          return result.payout;
        },

        completeDuel: (outcome) => {
          const s = get();
          const today = s.today();
          const d = s.social.duels.day === today ? s.social.duels : { ...s.social.duels, day: today, rewardedToday: 0 };
          const paid = d.rewardedToday < REWARDED_DUELS_PER_DAY;
          const r = DUEL_REWARD[outcome];
          const reward = award({ xp: (m) => Math.round(r.xp * m), coins: paid ? r.coins : 0, minutes: ACTIVITY_MINUTES.duel });
          set({
            social: {
              ...get().social,
              duels: { played: d.played + 1, won: d.won + (outcome === 'win' ? 1 : 0), day: today, rewardedToday: d.rewardedToday + (paid ? 1 : 0) },
            },
          });
          return { ...reward, practice: !paid };
        },
        setLeagueTier: (tier, settledWeek) => set({ social: { ...get().social, tier, tierSettledWeek: settledWeek } }),

        noteSaveOffered: () =>
          set({ savePrompt: { offers: get().savePrompt.offers + 1, lastDay: get().today(), lessonsAtLast: Object.keys(get().lessons).length } }),
      };
    },
    {
      name: 'kip-game',
      version: STATE_VERSION,
      migrate: (persisted, version) => migrateGameState(persisted, version) as unknown as GameState,
      storage: createJSONStorage(() => mmkvStorage),
      partialize: persistedFields,
    },
  ),
);
