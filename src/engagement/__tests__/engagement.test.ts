import { addDays, dayKey, daysBetween, weekday } from '../days';
import { planNudges, respectQuietHours } from '../nudges';
import { dueReviews, markReviewed } from '../review';
import {
  canClaimDividend,
  computeFinIQ,
  dividendAmount,
  finIQBand,
  lessonXp,
  ONBOARDING_FINIQ_BONUS,
} from '../rewards';
import {
  activeInLast7,
  buyFreeze,
  displayStreak,
  FREEZE_COST,
  initialStreak,
  MAX_FREEZES,
  recordActivity,
  shellRings,
  streakMultiplier,
  streakStatus,
} from '../streak';

describe('day keys', () => {
  it('uses the given time zone at midnight boundaries', () => {
    // 18:45 UTC on 31 Oct is already 1 Nov 00:15 in India (UTC+5:30).
    const instant = new Date(Date.UTC(2026, 9, 31, 18, 45));
    expect(dayKey(instant, 'Asia/Kolkata')).toBe('2026-11-01');
    expect(dayKey(instant, 'UTC')).toBe('2026-10-31');
    expect(dayKey(instant, 'America/New_York')).toBe('2026-10-31');
  });

  it('counts days across month and year ends', () => {
    expect(daysBetween('2026-10-31', '2026-11-01')).toBe(1);
    expect(daysBetween('2026-12-31', '2027-01-02')).toBe(2);
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(weekday('2026-11-01')).toBe(0); // Sunday
  });
});

describe('Knowledge SIP streak', () => {
  it('starts, continues and ignores repeat activity on the same day', () => {
    let s = recordActivity(initialStreak, '2026-10-31');
    expect(s.event).toBe('started');
    expect(s.state.count).toBe(1);
    s = recordActivity(s.state, '2026-10-31');
    expect(s.event).toBe('same-day');
    s = recordActivity(s.state, '2026-11-01');
    expect(s.event).toBe('continued');
    expect(s.state.count).toBe(2);
  });

  it('a missed day is a withdrawal that resets the streak and multiplier', () => {
    const a = recordActivity(recordActivity(initialStreak, '2026-10-30').state, '2026-10-31').state;
    expect(streakMultiplier(a.count)).toBeCloseTo(1.01, 6);
    expect(streakStatus(a, '2026-11-02')).toBe('broken');
    expect(displayStreak(a, '2026-11-02')).toBe(0);
    const b = recordActivity(a, '2026-11-02');
    expect(b.event).toBe('reset');
    expect(b.state.count).toBe(1);
    expect(b.state.longest).toBe(2);
    expect(streakMultiplier(b.state.count)).toBe(1);
  });

  it('an emergency-fund freeze covers a missed day and is consumed', () => {
    const start = { ...recordActivity(initialStreak, '2026-10-31').state, freezes: 1 };
    expect(streakStatus(start, '2026-11-02')).toBe('protected');
    const r = recordActivity(start, '2026-11-02');
    expect(r.event).toBe('protected');
    expect(r.freezesUsed).toBe(1);
    expect(r.state.freezes).toBe(0);
    expect(r.state.count).toBe(2);
  });

  it('one freeze cannot cover two missed days', () => {
    const start = { ...recordActivity(initialStreak, '2026-10-31').state, freezes: 1 };
    const r = recordActivity(start, '2026-11-03');
    expect(r.event).toBe('reset');
    expect(r.state.freezes).toBe(1);
  });

  it('the multiplier compounds at 1% per day and caps at 1.5x', () => {
    expect(streakMultiplier(1)).toBe(1);
    expect(streakMultiplier(11)).toBeCloseTo(Math.pow(1.01, 10), 6);
    expect(streakMultiplier(365)).toBe(1.5);
  });

  it('grows a shell ring each full week', () => {
    expect(shellRings(6)).toBe(0);
    expect(shellRings(7)).toBe(1);
    expect(shellRings(15)).toBe(2);
  });

  it('buys freezes with coins up to the cap', () => {
    const one = buyFreeze(initialStreak, FREEZE_COST + 70);
    expect(one.ok && one.coins).toBe(70);
    const full = { ...initialStreak, freezes: MAX_FREEZES };
    expect(buyFreeze(full, 500)).toEqual({ ok: false, reason: 'max-held' });
    expect(buyFreeze(initialStreak, 10)).toEqual({ ok: false, reason: 'not-enough-coins' });
  });

  it('counts active days in the last week', () => {
    let s = initialStreak;
    for (const d of ['2026-10-20', '2026-10-27', '2026-10-29', '2026-10-31']) s = recordActivity(s, d).state;
    expect(activeInLast7(s, '2026-10-31')).toBe(3);
  });
});

describe('rewards', () => {
  it('applies the streak multiplier to lesson XP', () => {
    expect(lessonXp({ correct: 2, total: 2 }, 1)).toBe(40);
    expect(lessonXp({ correct: 2, total: 2 }, 1.5)).toBe(60);
    expect(lessonXp({ correct: 1, total: 2, boss: true }, 1)).toBe(45);
  });

  it('Dividend Day is weekly and rewards consistency deterministically', () => {
    expect(canClaimDividend(null, '2026-10-31')).toBe(true);
    expect(canClaimDividend('2026-10-28', '2026-10-31')).toBe(false);
    expect(canClaimDividend('2026-10-24', '2026-10-31')).toBe(true);
    expect(dividendAmount(7, 10)).toBe(40);
    expect(dividendAmount(7, 10)).toBeGreaterThan(dividendAmount(2, 10));
  });

  it('FinIQ starts at 300, gets the onboarding bonus, and rises with mastery', () => {
    expect(computeFinIQ(false, [])).toBe(300);
    expect(computeFinIQ(true, [])).toBe(300 + ONBOARDING_FINIQ_BONUS);
    const sloppy = computeFinIQ(true, [{ accuracy: 0 }]);
    const sharp = computeFinIQ(true, [{ accuracy: 1 }]);
    expect(sharp).toBeGreaterThan(sloppy);
    expect(computeFinIQ(true, Array.from({ length: 200 }, () => ({ accuracy: 1, boss: true })))).toBe(900);
    expect(finIQBand(320).name).toBe('Starter');
    expect(finIQBand(600).name).toBe('Investor');
  });
});

describe('spaced review', () => {
  it('brings lessons back on day 1, 3, 7 and 21', () => {
    let rec = { completedDay: '2026-10-01', reviewsDone: 0 };
    expect(dueReviews({ a: rec }, '2026-10-01')).toEqual([]);
    expect(dueReviews({ a: rec }, '2026-10-02')).toEqual(['a']);
    rec = markReviewed(rec, '2026-10-02');
    expect(dueReviews({ a: rec }, '2026-10-02')).toEqual([]);
    expect(dueReviews({ a: rec }, '2026-10-03')).toEqual([]);
    expect(dueReviews({ a: rec }, '2026-10-04')).toEqual(['a']);
    const done = { completedDay: '2026-01-01', reviewsDone: 4 };
    expect(dueReviews({ done }, '2026-10-31')).toEqual([]);
  });
});

describe('nudges', () => {
  const base = { today: '2026-10-31', nowMinutes: 9 * 60, reminder: { hour: 18, minute: 0 }, activeToday: false, streak: 4, playerName: 'Aarav' };

  it('moves reminders out of quiet hours', () => {
    expect(respectQuietHours({ hour: 23, minute: 0 })).toEqual({ hour: 21, minute: 30 });
    expect(respectQuietHours({ hour: 6, minute: 0 })).toEqual({ hour: 7, minute: 30 });
    expect(respectQuietHours({ hour: 18, minute: 0 })).toEqual({ hour: 18, minute: 0 });
  });

  it('sends at most one nudge per day and backs off over time', () => {
    const plan = planNudges(base);
    const days = plan.map((p) => p.day);
    expect(new Set(days).size).toBe(days.length);
    expect(days).toEqual(['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-07', '2026-11-14', '2026-11-21', '2026-11-28']);
    expect(plan[3].kind).toBe('letter');
  });

  it('skips today when the player is already active or the time has passed', () => {
    expect(planNudges({ ...base, activeToday: true })[0].day).toBe('2026-11-01');
    expect(planNudges({ ...base, nowMinutes: 19 * 60 })[0].day).toBe('2026-11-01');
  });

  it('never schedules inside quiet hours', () => {
    for (const p of planNudges({ ...base, reminder: { hour: 23, minute: 15 } })) {
      const m = p.hour * 60 + p.minute;
      expect(m >= 7 * 60 && m < 22 * 60).toBe(true);
    }
  });

  it('respects the school-hours mute on weekdays only', () => {
    const plan = planNudges({ ...base, today: '2026-11-02', nowMinutes: 0, reminder: { hour: 10, minute: 0 }, schoolHoursMute: true });
    const monday = plan.find((p) => p.day === '2026-11-02');
    const sunday = plan.find((p) => p.day === '2026-11-08');
    expect(monday && [monday.hour, monday.minute]).toEqual([14, 30]);
    expect(sunday).toBeUndefined(); // Sunday 8 Nov is not in the back-off schedule
    const sat = planNudges({ ...base, today: '2026-11-07', nowMinutes: 0, reminder: { hour: 10, minute: 0 }, schoolHoursMute: true })[0];
    expect([sat.hour, sat.minute]).toEqual([10, 0]);
  });
});
