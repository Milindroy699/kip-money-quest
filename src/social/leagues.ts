/**
 * Weekly leagues on Firestore. Signed-in players publish their weekly XP under a pseudonymous
 * handle (never a real name), in a league per week and tier. When a new week starts, each player
 * settles their own move: top 7 go up a tier, bottom 5 go down. No server needed for a beta.
 * Rules for these paths are in docs/accounts.md.
 */
import { collection, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';

import { firebaseDb } from '../account/firebase';

export const TIERS = ['Piggy Bank', 'Fixed Deposit', 'Bond', 'Index', 'Blue Chip', 'Compounder'] as const;
export const TIER_EMOJI = ['🐷', '🔒', '📜', '📊', '💎', '🐢'] as const;
export const PROMOTE = 7;
export const DEMOTE = 5;
/** Below this many players, nobody is demoted (small leagues shouldn't punish). */
export const MIN_FOR_DEMOTION = 10;

export interface Standing {
  uid: string;
  handle: string;
  xp: number;
}

/** A player's tier for next week, from their rank (1 = top) among `count` players last week. */
export function nextTier(tier: number, rank: number, count: number, xp: number): number {
  if (xp <= 0) return tier; // didn't play: stay put
  if (rank <= PROMOTE && tier < TIERS.length - 1) return tier + 1;
  if (count >= MIN_FOR_DEMOTION && rank > count - DEMOTE && tier > 0) return tier - 1;
  return tier;
}

export const leagueId = (weekStart: string, tier: number) => `${weekStart}_${tier}`;

export async function publishWeeklyXp(uid: string, handle: string, weekStart: string, tier: number, xp: number): Promise<void> {
  const db = firebaseDb();
  if (!db) return;
  await setDoc(doc(db, 'leagues', leagueId(weekStart, tier), 'members', uid), { handle, xp: Math.round(xp), tier, updatedAt: serverTimestamp() });
}

export async function fetchStandings(weekStart: string, tier: number, max = 200): Promise<Standing[]> {
  const db = firebaseDb();
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'leagues', leagueId(weekStart, tier), 'members'), orderBy('xp', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ uid: d.id, handle: String(d.data().handle ?? 'Player'), xp: Number(d.data().xp ?? 0) }));
}

/** Where `uid` finished: 1-based rank and league size (null if they didn't take part). */
export function rankIn(standings: Standing[], uid: string): { rank: number; count: number; xp: number } | null {
  const i = standings.findIndex((s) => s.uid === uid);
  return i < 0 ? null : { rank: i + 1, count: standings.length, xp: standings[i].xp };
}
