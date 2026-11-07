/**
 * What Dash shouts as he overtakes Kip after a slip. Cheeky, never mean, and each line hints at the
 * money lesson behind the slip. Pure, so the lines are checked by tests.
 */
import type { OvertakeReason } from './engine';

export const DASH_TAUNTS: Record<OvertakeReason, string[]> = {
  missedCoins: ['Leaving coins on the road? I’ll take ’em! 🐇', 'Those coins won’t pick themselves up!', 'Missed a whole line. Catch me if you can!'],
  impulse: ['SALE! I love a SALE! 🛍️', 'Impulse buy? That’s my move!', 'Spend it now, worry later! Right? Right?'],
  hotTip: ['Told you my tip was hot! 🔥', 'Fell for my hot tip? Ha!', 'Tips are fun… until they aren’t!'],
  fee: ['Fees, fees, fees! Slow and pricey!', 'That toll cost you. Not me!', 'Jump the fees next time, shell-boy!'],
  cashOut: ['Cashed out? Your snowball just melted!', 'In and out, in and out… like me!', 'Pulled your money out? Bold!'],
  gateMissed: ['Skipped the INVEST gate? Idle coins again!', 'No gate? The Melt says thanks!', 'Missed your chance to bank it!'],
  answerWrong: ['Ooh, wrong one! Guessing is my thing!', 'Ha! Even I’d have got that… maybe.', 'Wrong gate! See you up ahead!'],
  emergencyShort: ['No cash for emergencies? Oops!', 'Sold in a hurry? Classic Dash move!', 'Always keep a little cash. I never do!'],
};

/** The taunt for a given overtake (they take turns, so the same slip doesn't repeat the same line). */
export function tauntFor(reason: OvertakeReason, nth: number): string {
  const lines = DASH_TAUNTS[reason];
  return lines[nth % lines.length];
}
