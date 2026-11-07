/** Calendar-day helpers. Day keys are 'YYYY-MM-DD' in the player's local time zone. */
export type DayKey = string;

const DAY_MS = 86_400_000;

/**
 * Day key for `date`. Pass an IANA `timeZone` (e.g. 'Asia/Kolkata') to compute it for a
 * specific zone; otherwise the device's local zone is used.
 */
export function dayKey(date: Date, timeZone?: string): DayKey {
  if (timeZone) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toUtcMidnight(key: DayKey): number {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole calendar days from `from` to `to` (positive if `to` is later). */
export function daysBetween(from: DayKey, to: DayKey): number {
  return Math.round((toUtcMidnight(to) - toUtcMidnight(from)) / DAY_MS);
}

export function addDays(key: DayKey, days: number): DayKey {
  const t = new Date(toUtcMidnight(key) + days * DAY_MS);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(key: DayKey): number {
  return new Date(toUtcMidnight(key)).getUTCDay();
}
