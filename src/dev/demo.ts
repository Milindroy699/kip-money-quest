/**
 * Development-only demo mode, for screenshots and design QA.
 * Start Metro with EXPO_PUBLIC_DEMO=1 to seed sample progress, EXPO_PUBLIC_DEMO=new for a player who
 * has just finished onboarding (no lessons yet), or EXPO_PUBLIC_DEMO=tour to also auto-visit the main
 * screens every few seconds. It never runs in production builds.
 */
import { router } from 'expo-router';

import { STARTER_CARDS } from '../content';
import { addDays } from '../engagement/days';
import { useGame } from '../state/game';

const MODE = process.env.EXPO_PUBLIC_DEMO;
export const DEMO_ENABLED = __DEV__ && (MODE === '1' || MODE === 'tour' || MODE === 'new');
export const DEMO_TOUR = __DEV__ && MODE === 'tour';

/** Each stop on the tour and how long to stay there (ms). */
export const TOUR: [route: string, dwellMs: number][] = [
  ['/', 7000],
  ['/plan', 7000],
  ['/cards', 6000],
  ['/league', 6000],
  ['/you', 6000],
  ['/lesson/w2-l4?step=0', 6000],
  ['/lesson/w2-l4?step=2', 7000],
  ['/lesson/w2-l5?step=3', 7000],
  ['/run/inflation?autostart=1', 22000],
  ['/lesson/w0-l3?preview=reward', 7000],
  ['/dividend', 6000],
  ['/card/indexFund', 6000],
];
export const TOUR_ROUTES = TOUR.map(([r]) => r);

export function seedDemoState() {
  const s = useGame.getState();
  const today = s.today();
  if (MODE === 'new') {
    useGame.setState({
      profile: { ...s.profile, name: 'Nova', age: 16, ageBand: '16-19', goal: 'bike', goalPrice: 90000, targetAge: 25, loadout: 'fd', onboarded: true },
      streak: { count: 1, longest: 1, lastActiveDay: today, freezes: 0, activeDays: [today] },
      coins: 40,
      xp: 60,
      lessons: {},
      cards: [...STARTER_CARDS],
      runs: { count: 2, bestScore: 60, dashDodged: 0 },
      lastDividendDay: null,
    });
    return;
  }
  const done = ['w0-l1', 'w0-l2', 'w0-l3', 'w0-l4', 'w1-l1', 'w1-l2', 'w1-l3', 'w1-l4', 'w1-l5', 'w2-l1', 'w2-l2', 'w2-l3'];
  const lessons = Object.fromEntries(done.map((id, i) => [id, { completedDay: addDays(today, -12 + i), reviewsDone: 0, accuracy: i % 3 === 0 ? 0.67 : 1, boss: id.endsWith('l5') }]));
  const activeDays = [0, 1, 2, 3, 4].map((d) => addDays(today, -1 - d)).reverse();
  useGame.setState({
    profile: { ...s.profile, name: 'Nova', age: 16, ageBand: '16-19', goal: 'laptop', goalPrice: 60000, targetAge: 25, loadout: 'fd', onboarded: true },
    streak: { count: 5, longest: 8, lastActiveDay: addDays(today, -1), freezes: 1, activeDays },
    coins: 186,
    xp: 640,
    weekly: { weekStart: addDays(today, -((new Date().getDay() + 6) % 7)), xp: 210 },
    lessons,
    cards: [...STARTER_CARDS, 'savings', 'sip', 'indexFund'],
    runs: { count: 3, bestScore: 142, dashDodged: 4 },
    daily: { day: addDays(today, -1), runs: 0, minutes: 0, replayXp: 0 },
    lastDividendDay: addDays(today, -8),
  });
}

/** Visits each tour stop in turn, staying for its dwell time. Returns a cancel function. */
export function startDemoTour() {
  let i = 0;
  let timer: ReturnType<typeof setTimeout>;
  const go = () => {
    const [route, dwell] = TOUR[i % TOUR.length];
    if (router.canDismiss()) router.dismissAll();
    if (route !== '/') router.push(route as never);
    i++;
    timer = setTimeout(go, dwell);
  };
  timer = setTimeout(go, 3000);
  return () => clearTimeout(timer);
}
