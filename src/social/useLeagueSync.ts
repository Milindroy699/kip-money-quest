/**
 * Keeps the real league current for signed-in players: once a week it settles last week's
 * result (promotion or demotion), and a few seconds after XP changes it publishes this week's XP.
 */
import { useEffect } from 'react';

import { cloudConfigured } from '../account/config';
import { addDays, weekday } from '../engagement/days';
import { useGame } from '../state/game';
import { handleFor } from './handle';
import { fetchStandings, nextTier, publishWeeklyXp, rankIn } from './leagues';

const weekStartOf = (day: string) => addDays(day, -((weekday(day) + 6) % 7));

export function useLeagueSync() {
  useEffect(() => {
    if (!cloudConfigured) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let busy = false;
    const sync = async () => {
      const s = useGame.getState();
      const account = s.account;
      if (!account?.cloud || busy) return;
      busy = true;
      try {
        const weekStart = weekStartOf(s.today());
        if (s.social.tierSettledWeek !== weekStart) {
          // A new week: move up or down based on last week's finish, once.
          const last = await fetchStandings(addDays(weekStart, -7), s.social.tier).catch(() => null);
          if (last) {
            const r = rankIn(last, account.uid);
            s.setLeagueTier(r ? nextTier(s.social.tier, r.rank, r.count, r.xp) : s.social.tier, weekStart);
          }
        }
        const g = useGame.getState();
        const xp = g.weekly.weekStart === weekStart ? g.weekly.xp : 0;
        await publishWeeklyXp(account.uid, handleFor(account.uid), weekStart, g.social.tier, xp).catch(() => {});
      } finally {
        busy = false;
      }
    };
    sync();
    const unsubscribe = useGame.subscribe((state, prev) => {
      if (state.weekly.xp !== prev.weekly.xp || state.account !== prev.account) {
        clearTimeout(timer);
        timer = setTimeout(sync, 5000);
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);
}
