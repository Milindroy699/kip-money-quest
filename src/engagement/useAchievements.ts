/** The Trophy Room's statuses, from live game state. */
import { CARDS, WORLDS } from '../content';
import { useGame } from '../state/game';
import { achievementStatuses, type AchievementInput } from './achievements';

export function useAchievements() {
  const lessons = useGame((s) => s.lessons);
  const longestStreak = useGame((s) => s.streak.longest);
  const runs = useGame((s) => s.runs.count);
  const cards = useGame((s) => s.cards.length);
  const finiq = useGame((s) => s.finIQ());
  const dividendClaimed = useGame((s) => s.lastDividendDay !== null);
  const invested = useGame((s) => s.portfolio.lots.length > 0);
  const duelsWon = useGame((s) => s.social.duels.won);
  const quiz = useGame((s) => s.quiz);
  const input: AchievementInput = {
    lessons,
    worldsDone: WORLDS.filter((w) => w.lessons.every((l) => lessons[l.id])).map((w) => w.id),
    longestStreak,
    runs,
    cards,
    totalCards: CARDS.length,
    finiq,
    dividendClaimed,
    invested,
    duelsWon,
    quizzesPlayed: quiz?.played ?? 0,
    quizPerfect: quiz?.perfect ?? 0,
  };
  return achievementStatuses(input);
}
