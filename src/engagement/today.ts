/**
 * "For you today" on Home: the few most useful things to do right now, in Kip's voice, shown as
 * a swipeable row of cards. Pure (no React) so the priority order is unit-tested. (Kip Run has its
 * own card on Home, so it isn't a nudge.)
 */
import type { SpotId } from '../campus/map';

/** The picture on a nudge card: a map building, or Kip in a mood. */
export type TodayArt = SpotId | 'map' | 'kipThink' | 'kipSleepy';

export type TodayAction = { kind: 'route'; href: '/review' | '/dividend' | '/portfolio' | '/quiz' } | { kind: 'campus'; focus: string } | { kind: 'reminders' };

export interface TodayNudge {
  id: string;
  emoji: string;
  title: string;
  text: string;
  action: TodayAction;
  /** The button label, e.g. "Review now". */
  cta: string;
  art: TodayArt;
  /** Gold for rewards waiting, green for learning, purple for play, plain otherwise. */
  tone: 'gold' | 'green' | 'purple' | 'plain';
}

export interface TodayContext {
  /** Spots that just opened on the map, with the map's own names. */
  newSpots: { id: string; name: string; emoji: string; activity: string; blurb: string }[];
  mapTitle: string;
  dividendReady: boolean;
  reviewsDue: number;
  remindersOff: boolean;
  /** Today's Practice Portfolio move as a fraction (0.012 = +1.2%), or null with no portfolio. */
  portfolioMove: number | null;
  /** Quiz Battle just opened and hasn't been played yet. */
  quizNew?: boolean;
  /** Quiz Battle is open and a good idea today (played before, not yet today, no reviews due). */
  quizSuggest?: boolean;
}

export const MAX_TODAY = 4;

export function todayNudges(ctx: TodayContext): TodayNudge[] {
  const out: TodayNudge[] = [];
  // Several spots opening at once (e.g. a first visit after an update) share one nudge.
  const [first, ...more] = ctx.newSpots;
  if (first && more.length === 0) {
    out.push({ id: `new-${first.id}`, emoji: first.emoji, title: `New on ${ctx.mapTitle}: ${first.name}`, text: `${first.activity}: ${lowerFirst(first.blurb)}`, action: { kind: 'campus', focus: first.id }, cta: `Go to ${first.name}`, art: first.id as SpotId, tone: 'green' });
  } else if (first) {
    out.push({
      id: 'new-spots',
      emoji: '🗺️',
      title: `${ctx.newSpots.length} new spots on ${ctx.mapTitle}`,
      text: `${listOf(ctx.newSpots.map((s) => `${s.name} (${s.activity})`))} just opened.`,
      action: { kind: 'campus', focus: first.id },
      cta: 'Open the map',
      art: 'map',
      tone: 'green',
    });
  }
  if (ctx.quizNew) {
    out.push({ id: 'quiz-new', emoji: '🧠', title: 'New: Quiz Battle!', text: 'Quiz yourself on what you’ve learned, or take on a friend 1v1 on one phone.', action: { kind: 'route', href: '/quiz' }, cta: 'Play Quiz Battle', art: 'library', tone: 'purple' });
  }
  if (ctx.dividendReady) {
    out.push({ id: 'dividend', emoji: '💰', title: 'Dividend Day is here', text: 'Your weekly reward is ready. The longer your streak, the bigger it gets.', action: { kind: 'route', href: '/dividend' }, cta: 'Claim reward', art: 'bank', tone: 'gold' });
  }
  if (ctx.reviewsDue > 0) {
    const n = ctx.reviewsDue;
    out.push({ id: 'reviews', emoji: '📚', title: `${n} review${n > 1 ? 's' : ''} due`, text: 'Two quick minutes so yesterday’s ideas stick for good.', action: { kind: 'route', href: '/review' }, cta: 'Review now', art: 'kipThink', tone: 'green' });
  }
  if (ctx.quizSuggest && ctx.reviewsDue === 0) {
    out.push({ id: 'quiz', emoji: '🧠', title: 'Quick quiz?', text: '8 questions from your lessons. Beat your best, or challenge a friend.', action: { kind: 'route', href: '/quiz' }, cta: 'Start quiz', art: 'library', tone: 'purple' });
  }
  if (ctx.remindersOff) {
    out.push({ id: 'reminders', emoji: '🔔', title: 'Turn on reminders', text: 'One gentle nudge a day, at your time. Never during quiet hours.', action: { kind: 'reminders' }, cta: 'Turn on', art: 'kipSleepy', tone: 'plain' });
  }
  if (ctx.portfolioMove !== null && Math.abs(ctx.portfolioMove) >= 0.001) {
    const up = ctx.portfolioMove >= 0;
    out.push({
      id: 'portfolio',
      emoji: up ? '📈' : '📉',
      title: `Practice Portfolio ${up ? '▲' : '▼'} ${(Math.abs(ctx.portfolioMove) * 100).toFixed(1)}%`,
      text: up ? 'Another market month passed overnight. Patience is doing its job.' : 'A down month. Long-term investors expect these and stay the course.',
      action: { kind: 'route', href: '/portfolio' },
      cta: 'Open portfolio',
      art: 'lab',
      tone: 'plain',
    });
  }
  return out.slice(0, MAX_TODAY);
}

const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/** "A", "A and B", "A, B and C". */
export function listOf(items: string[]): string {
  return items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
