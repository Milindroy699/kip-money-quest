/**
 * Progress backup for signed-in players: the same fields saved on the phone, stored as one
 * Firestore document per account (progress/{uid}; rules in docs/accounts.md).
 */
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { migrateGameState, STATE_VERSION } from '../state/migrations';
import { firebaseDb } from './firebase';

export interface ProgressSnapshot {
  version: number;
  /** For choosing between two copies without parsing them. */
  xp: number;
  lessonsDone: number;
  /** The saved fields as JSON (the account link itself is left out). */
  data: string;
}

type Saved = { xp: number; lessons: Record<string, unknown>; account?: unknown } & Record<string, unknown>;

export function snapshotOf(saved: Saved): ProgressSnapshot {
  const { account: _account, ...rest } = saved;
  return { version: STATE_VERSION, xp: saved.xp, lessonsDone: Object.keys(saved.lessons).length, data: JSON.stringify(rest) };
}

/**
 * On sign-in: keep whichever copy has more progress. A fresh phone restores the cloud copy; a
 * phone with more progress than the cloud uploads its own. Ties keep the phone's.
 */
export function chooseOnSignIn(local: { xp: number; lessonsDone: number }, remote: { xp: number; lessonsDone: number } | null): 'upload' | 'restore' {
  if (!remote) return 'upload';
  if (remote.xp > local.xp) return 'restore';
  if (remote.xp === local.xp && remote.lessonsDone > local.lessonsDone) return 'restore';
  return 'upload';
}

/** The cloud copy as saved state, migrated to this app version. */
export function restoredState(snapshot: ProgressSnapshot): Record<string, unknown> {
  return migrateGameState(JSON.parse(snapshot.data), snapshot.version);
}

export async function pushProgress(uid: string, snapshot: ProgressSnapshot): Promise<void> {
  const db = firebaseDb();
  if (!db) return;
  await setDoc(doc(db, 'progress', uid), { ...snapshot, updatedAt: serverTimestamp() });
}

export async function pullProgress(uid: string): Promise<ProgressSnapshot | null> {
  const db = firebaseDb();
  if (!db) return null;
  const found = await getDoc(doc(db, 'progress', uid));
  if (!found.exists()) return null;
  const d = found.data();
  return { version: Number(d.version), xp: Number(d.xp), lessonsDone: Number(d.lessonsDone), data: String(d.data) };
}

/** The version of the parents' notice shown at consent (bump when the wording changes). */
export const CONSENT_NOTICE = 'parents-2026-11';

/** A server-side record of who consented and to which notice. No names or emails. */
export async function recordConsent(uid: string, holder: 'self' | 'parent', teenAge: number | null): Promise<void> {
  const db = firebaseDb();
  if (!db) return;
  await setDoc(doc(db, 'consents', uid), { holder, notice: CONSENT_NOTICE, teenAge: teenAge ?? null, at: serverTimestamp() });
}

export async function deleteProgress(uid: string): Promise<void> {
  const db = firebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, 'progress', uid));
}
