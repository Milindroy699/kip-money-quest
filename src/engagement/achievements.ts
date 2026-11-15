/**
 * Trophies for the Trophy Room (the Trophies tab): four shelves of achievements, each bronze,
 * silver or gold, earned from progress the game already tracks. Pure, so the rules are tested.
 */
export type Tier = 'bronze' | 'silver' | 'gold';
export type Shelf = 'learning' | 'habits' | 'collection' | 'play';

export interface AchievementInput {
  /** Finished lessons: accuracy 0–1, and whether it was a boss lesson. */
  lessons: Record<string, { accuracy: number; boss: boolean }>;
  /** Worlds with every lesson finished, e.g. ['w0', 'w1']. */
  worldsDone: string[];
  longestStreak: number;
  runs: number;
  cards: number;
  totalCards: number;
  finiq: number;
  dividendClaimed: boolean;
  invested: boolean;
  duelsWon: number;
  /** Quiz Battles finished, and how many had every answer right. */
  quizzesPlayed: number;
  quizPerfect: number;
}

export interface Achievement {
  id: string;
  shelf: Shelf;
  tier: Tier;
  emoji: string;
  title: string;
  /** How to earn it, in a few words. */
  how: string;
  target: number;
  /** Where progress starts (FinIQ starts at 300, not 0). */
  start?: number;
  value: (i: AchievementInput) => number;
}

const world = (id: string) => (i: AchievementInput) => (i.worldsDone.includes(id) ? 1 : 0);
const perfect = (i: AchievementInput) => Object.values(i.lessons).filter((l) => l.accuracy >= 1).length;
const bosses = (i: AchievementInput) => Object.values(i.lessons).filter((l) => l.boss).length;

export const ACHIEVEMENTS: Achievement[] = [
  // Learning: the path through the worlds.
  { id: 'first-lesson', shelf: 'learning', tier: 'bronze', emoji: '📘', title: 'First Lesson', how: 'Finish any lesson', target: 1, value: (i) => Object.keys(i.lessons).length },
  { id: 'money-town', shelf: 'learning', tier: 'bronze', emoji: '🏘️', title: 'Money Town Grad', how: 'Finish Money Town', target: 1, value: world('w0') },
  { id: 'melt', shelf: 'learning', tier: 'silver', emoji: '🫧', title: 'Melt Fighter', how: 'Finish The Melt (World 1)', target: 1, value: world('w1') },
  { id: 'snowball', shelf: 'learning', tier: 'silver', emoji: '❄️', title: 'Snowballer', how: 'Finish Snowball Valley (World 2)', target: 1, value: world('w2') },
  { id: 'risk', shelf: 'learning', tier: 'silver', emoji: '🧗', title: 'Risk Ranger', how: 'Finish Risk Ridge (World 3)', target: 1, value: world('w3') },
  { id: 'bazaar', shelf: 'learning', tier: 'silver', emoji: '🛍️', title: 'Bazaar Pro', how: 'Finish Product Bazaar (World 4)', target: 1, value: world('w4') },
  { id: 'fort', shelf: 'learning', tier: 'gold', emoji: '🏰', title: 'Fort Builder', how: 'Finish Portfolio Fort (World 5)', target: 1, value: world('w5') },
  { id: 'launch', shelf: 'learning', tier: 'gold', emoji: '🚀', title: 'Launch Ready', how: 'Finish Future You (World 9)', target: 1, value: world('w9') },
  // Habits: showing up, and doing it well.
  { id: 'streak-3', shelf: 'habits', tier: 'bronze', emoji: '🔥', title: 'On Fire', how: 'Reach a 3-day streak', target: 3, value: (i) => i.longestStreak },
  { id: 'streak-7', shelf: 'habits', tier: 'silver', emoji: '📅', title: 'Week Warrior', how: 'Reach a 7-day streak', target: 7, value: (i) => i.longestStreak },
  { id: 'streak-30', shelf: 'habits', tier: 'gold', emoji: '💎', title: 'Unstoppable', how: 'Reach a 30-day streak', target: 30, value: (i) => i.longestStreak },
  { id: 'perfect-5', shelf: 'habits', tier: 'silver', emoji: '⭐', title: 'Perfectionist', how: 'Get every question right in 5 lessons', target: 5, value: perfect },
  { id: 'boss', shelf: 'habits', tier: 'silver', emoji: '👑', title: 'Boss Slayer', how: 'Beat a boss lesson', target: 1, value: bosses },
  { id: 'boss-5', shelf: 'habits', tier: 'gold', emoji: '🗡️', title: 'Boss Hunter', how: 'Beat 5 boss lessons', target: 5, value: bosses },
  // Collection: cards and FinIQ.
  { id: 'cards-5', shelf: 'collection', tier: 'bronze', emoji: '🃏', title: 'Collector', how: 'Collect 5 cards', target: 5, value: (i) => i.cards },
  { id: 'cards-12', shelf: 'collection', tier: 'silver', emoji: '🗂️', title: 'Curator', how: 'Collect 12 cards', target: 12, value: (i) => i.cards },
  { id: 'cards-all', shelf: 'collection', tier: 'gold', emoji: '🏆', title: 'Full Deck', how: 'Collect every card', target: 24, value: (i) => (i.cards >= i.totalCards ? 24 : Math.min(i.cards, 23)) },
  { id: 'finiq-saver', shelf: 'collection', tier: 'bronze', emoji: '🎓', title: 'Saver', how: 'Reach FinIQ 450', target: 450, start: 300, value: (i) => i.finiq },
  { id: 'finiq-investor', shelf: 'collection', tier: 'silver', emoji: '📊', title: 'Investor', how: 'Reach FinIQ 600', target: 600, start: 300, value: (i) => i.finiq },
  { id: 'finiq-compounder', shelf: 'collection', tier: 'gold', emoji: '🐢', title: 'Compounder', how: 'Reach FinIQ 750', target: 750, start: 300, value: (i) => i.finiq },
  // Play: games and rewards.
  { id: 'run-1', shelf: 'play', tier: 'bronze', emoji: '🏃', title: 'First Run', how: 'Finish a Kip Run', target: 1, value: (i) => i.runs },
  { id: 'run-25', shelf: 'play', tier: 'silver', emoji: '🏅', title: 'Marathoner', how: 'Finish 25 Kip Runs', target: 25, value: (i) => i.runs },
  { id: 'dividend', shelf: 'play', tier: 'bronze', emoji: '💰', title: 'Dividend Day', how: 'Collect a Dividend Day reward', target: 1, value: (i) => (i.dividendClaimed ? 1 : 0) },
  { id: 'invest', shelf: 'play', tier: 'bronze', emoji: '📈', title: 'First Investment', how: 'Invest coins in the Practice Portfolio', target: 1, value: (i) => (i.invested ? 1 : 0) },
  { id: 'duel-1', shelf: 'play', tier: 'silver', emoji: '⚔️', title: 'Duelist', how: 'Win a Market Duel', target: 1, value: (i) => i.duelsWon },
  { id: 'duel-10', shelf: 'play', tier: 'gold', emoji: '🥇', title: 'Duel Champion', how: 'Win 10 Market Duels', target: 10, value: (i) => i.duelsWon },
  { id: 'quiz-1', shelf: 'play', tier: 'bronze', emoji: '🧠', title: 'Quiz Starter', how: 'Finish a Quiz Battle', target: 1, value: (i) => i.quizzesPlayed },
  { id: 'quiz-perfect', shelf: 'play', tier: 'silver', emoji: '🌟', title: 'Quiz Whiz', how: 'Get every answer right in a Quiz Battle', target: 1, value: (i) => i.quizPerfect },
];

export const SHELVES: { id: Shelf; title: string }[] = [
  { id: 'learning', title: 'Learning' },
  { id: 'habits', title: 'Habits' },
  { id: 'collection', title: 'Collection' },
  { id: 'play', title: 'Play' },
];

export interface AchievementStatus {
  achievement: Achievement;
  earned: boolean;
  /** Progress toward the target, capped at the target. */
  value: number;
  /** 0–1, measured from the trophy's starting point. */
  progress: number;
}

export function achievementStatuses(input: AchievementInput): AchievementStatus[] {
  return ACHIEVEMENTS.map((a) => {
    const v = Math.min(a.value(input), a.target);
    const start = a.start ?? 0;
    return { achievement: a, earned: v >= a.target, value: v, progress: Math.max(0, (v - start) / (a.target - start)) };
  });
}

/** The trophy you're closest to earning (most progress, not yet earned), to point the player at. */
export function nextTrophy(statuses: AchievementStatus[]): AchievementStatus | undefined {
  return statuses.filter((s) => !s.earned).sort((a, b) => b.progress - a.progress)[0];
}
