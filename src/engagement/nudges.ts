/**
 * Kip's nudges. Pure planning logic: which local notifications to schedule for the next days.
 * Rules (docs/engagement-and-nudges.md):
 * - at most one per day, at the player's habit time
 * - quiet hours 22:00–07:00 (moved to 21:30 or 07:30, whichever is nearer)
 * - optional school-hours mute on weekdays (08:00–14:00 → moved to 14:30)
 * - back-off: daily nudges on day 1–2 after the last open, a "letter from Kip" on day 3 and
 *   day 7, then weekly. Nothing more.
 * - no nudge today if the player has already been active today
 */
import { addDays, weekday, type DayKey } from './days';

export interface ReminderTime {
  hour: number;
  minute: number;
}

export interface NudgeContext {
  today: DayKey;
  /** Current local time, used to skip a reminder that has already passed today. */
  nowMinutes: number;
  reminder: ReminderTime;
  activeToday: boolean;
  streak: number;
  playerName: string;
  schoolHoursMute?: boolean;
}

export interface PlannedNudge {
  day: DayKey;
  hour: number;
  minute: number;
  title: string;
  body: string;
  kind: 'daily' | 'streak' | 'curiosity' | 'melt' | 'weekly' | 'letter';
}

export const QUIET_START = 22 * 60;
export const QUIET_END = 7 * 60;

/** Moves a time out of quiet hours to the nearer edge (21:30 or 07:30). */
export function respectQuietHours(time: ReminderTime): ReminderTime {
  const m = time.hour * 60 + time.minute;
  if (m >= QUIET_START) return { hour: 21, minute: 30 };
  if (m < QUIET_END) return m < 2 * 60 ? { hour: 21, minute: 30 } : { hour: 7, minute: 30 };
  return time;
}

function respectSchool(time: ReminderTime, day: DayKey, mute: boolean): ReminderTime {
  const wd = weekday(day);
  const m = time.hour * 60 + time.minute;
  if (mute && wd >= 1 && wd <= 5 && m >= 8 * 60 && m < 14 * 60) return { hour: 14, minute: 30 };
  return time;
}

/** Days after the last open on which a nudge may be sent (back-off schedule). */
export const NUDGE_DAY_OFFSETS = [0, 1, 2, 3, 7, 14, 21, 28] as const;

function copyFor(offset: number, day: DayKey, ctx: NudgeContext): Omit<PlannedNudge, 'day' | 'hour' | 'minute'> {
  const name = ctx.playerName || 'friend';
  if (offset === 3) {
    return { kind: 'letter', title: 'A letter from Kip 🐢', body: `Hi ${name}, I saved your seat. No judgement, just a welcome-back bonus when you're ready.` };
  }
  if (offset >= 7) {
    return { kind: 'letter', title: 'Kip misses you', body: 'Compounding is patient, and so am I. One 3-minute lesson restarts your snowball.' };
  }
  if (weekday(day) === 0) {
    return { kind: 'weekly', title: 'Your weekly report is ready 📊', body: 'See what you learned this week, and share it with a parent.' };
  }
  if (offset === 0 && ctx.streak > 0) {
    return { kind: 'streak', title: `Your ${ctx.streak}-day snowball is rolling`, body: 'One quick lesson keeps it growing. Slow and steady compounds.' };
  }
  const rotation: Omit<PlannedNudge, 'day' | 'hour' | 'minute'>[] = [
    { kind: 'daily', title: 'Your Knowledge SIP is due', body: '3 minutes keeps the compounding going 🐢' },
    { kind: 'curiosity', title: 'Dash did something risky…', body: 'Dash just bought something on a hot tip. Want to see what happens?' },
    { kind: 'melt', title: 'The Melt crept in overnight', body: 'Your idle coins shrank a little. Put them to work?' },
  ];
  return rotation[offset % rotation.length];
}

/** Plans notifications from `ctx.today` onward, assuming the app was opened today. */
export function planNudges(ctx: NudgeContext): PlannedNudge[] {
  const plan: PlannedNudge[] = [];
  for (const offset of NUDGE_DAY_OFFSETS) {
    const day = addDays(ctx.today, offset);
    const time = respectSchool(respectQuietHours(ctx.reminder), day, ctx.schoolHoursMute ?? false);
    if (offset === 0) {
      const passed = time.hour * 60 + time.minute <= ctx.nowMinutes;
      if (ctx.activeToday || passed) continue;
    }
    plan.push({ day, hour: time.hour, minute: time.minute, ...copyFor(offset, day, ctx) });
  }
  return plan;
}
