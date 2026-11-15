/**
 * Games that live in each campus building, next to the lessons that teach them.
 * They open at the same lessons as everywhere else (see src/content/unlocks.ts).
 */
import { duelUnlocked, runModeUnlocked } from '../content/unlocks';
import { seasonComplete } from '../engagement/plan';

export interface Activity {
  key: string;
  emoji: string;
  title: string;
  text: string;
  href: '/run/inflation' | '/run/snowball' | '/run/risk' | '/run/timeframe' | '/run/chart' | '/portfolio' | '/duel?vs=dash' | '/plan';
  lockedText: string;
  unlocked: (completed: Record<string, unknown>, extra: { portfolioStarted: boolean }) => boolean;
}

export const WORLD_ACTIVITIES: Record<string, Activity[]> = {
  w1: [
    { key: 'inflation', emoji: '🏃', title: 'Kip Run: Inflation Chase', text: 'Outrun The Melt and keep your coins growing.', href: '/run/inflation', lockedText: '', unlocked: () => true },
    {
      key: 'portfolio',
      emoji: '📈',
      title: 'Practice Portfolio',
      text: 'Invest your coins in the products you unlock. 1 day = 1 market month.',
      href: '/portfolio',
      lockedText: 'Opens after lesson 4, Fixed Deposits.',
      unlocked: (c, x) => !!c['w1-l4'] || x.portfolioStarted,
    },
  ],
  w2: [{ key: 'snowball', emoji: '⛄', title: 'Kip Run: Snowball Run', text: 'Grow a snowball with coins in a row. Cashing out resets it.', href: '/run/snowball', lockedText: 'Opens at lesson 3, SIPs.', unlocked: (c) => runModeUnlocked('snowball', c) }],
  w3: [
    { key: 'risk', emoji: '🧗', title: 'Kip Run: Risk Lanes', text: 'Pick safe, balanced or wild gates, then ride the swings.', href: '/run/risk', lockedText: 'Opens at lesson 2, the risk ladder.', unlocked: (c) => runModeUnlocked('risk', c) },
    { key: 'duel', emoji: '⚔️', title: 'Market Duel vs Dash', text: 'Build a 5-card portfolio for a goal. Reckless doesn’t win.', href: '/duel?vs=dash', lockedText: 'Opens at lesson 3.', unlocked: (c) => duelUnlocked(c) },
  ],
  w7: [{ key: 'timeframe', emoji: '⏱️', title: 'Kip Run: Time Tracks', text: 'Scalp, intraday, swing, then long term. See what fees leave you.', href: '/run/timeframe', lockedText: 'Opens after lesson 3, Timeframe Racer.', unlocked: (c) => runModeUnlocked('timeframe', c) }],
  w8: [{ key: 'chart', emoji: '🏄', title: 'Chart Surfer', text: 'Surf a live chart and read support, resistance and patterns.', href: '/run/chart', lockedText: 'Opens after lesson 3, Reading charts.', unlocked: (c) => runModeUnlocked('chart', c) }],
  w9: [{ key: 'plan', emoji: '🚀', title: 'Your Launch Plan', text: 'Your goal, your monthly SIP and your mix, in one plan.', href: '/plan', lockedText: 'Opens when you finish Snowball Valley.', unlocked: (c) => seasonComplete(c) }],
};
