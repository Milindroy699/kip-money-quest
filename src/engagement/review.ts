/** Spaced review: completed lessons resurface on day 1, 3, 7 and 21 after completion. */
import { daysBetween, type DayKey } from './days';

export const REVIEW_INTERVALS = [1, 3, 7, 21] as const;

export interface ReviewRecord {
  completedDay: DayKey;
  reviewsDone: number;
  lastReviewDay?: DayKey;
}

export function isReviewDue(record: ReviewRecord, today: DayKey): boolean {
  if (record.reviewsDone >= REVIEW_INTERVALS.length) return false;
  if (record.lastReviewDay === today) return false;
  return daysBetween(record.completedDay, today) >= REVIEW_INTERVALS[record.reviewsDone];
}

/** Lesson ids due for review, oldest-due first. */
export function dueReviews(records: Record<string, ReviewRecord>, today: DayKey, limit = 3): string[] {
  return Object.entries(records)
    .filter(([, r]) => isReviewDue(r, today))
    .sort(([, a], [, b]) => daysBetween(b.completedDay, a.completedDay))
    .slice(0, limit)
    .map(([id]) => id);
}

export function markReviewed(record: ReviewRecord, today: DayKey): ReviewRecord {
  return { ...record, reviewsDone: record.reviewsDone + 1, lastReviewDay: today };
}
