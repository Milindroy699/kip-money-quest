/**
 * Friend duels on Firestore. A duel is a code, a seed and each side's chips. Scores are never
 * stored: both phones recompute them from the seed and the chips, so nobody can fake a score.
 */
import { doc, getDoc, onSnapshot, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { firebaseDb } from '../account/firebase';
import type { Chips } from '../duel/engine';

export interface DuelSide {
  uid: string;
  handle: string;
  chips: Chips | null;
}

export interface OnlineDuel {
  code: string;
  seed: number;
  a: DuelSide;
  b: DuelSide | null;
}

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0 or 1: easy to read out loud

export function newDuelCode(rand: () => number = Math.random): string {
  return Array.from({ length: 6 }, () => LETTERS[Math.floor(rand() * LETTERS.length)]).join('');
}

export function normaliseCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function read(code: string, data: Record<string, unknown> | undefined): OnlineDuel | null {
  if (!data) return null;
  return { code, seed: Number(data.seed), a: data.a as DuelSide, b: (data.b as DuelSide | null) ?? null };
}

export async function createDuel(code: string, seed: number, me: { uid: string; handle: string }): Promise<void> {
  const db = firebaseDb();
  if (!db) throw new Error('offline');
  await setDoc(doc(db, 'duels', code), { seed, createdAt: serverTimestamp(), a: { uid: me.uid, handle: me.handle, chips: null }, b: null });
}

/** Joins a friend's duel (once). Returns the duel, or a reason it can't be joined. */
export async function joinDuel(code: string, me: { uid: string; handle: string }): Promise<OnlineDuel | 'notFound' | 'full' | 'yours'> {
  const db = firebaseDb();
  if (!db) throw new Error('offline');
  const ref = doc(db, 'duels', code);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const duel = read(code, snap.data());
    if (!duel) return 'notFound';
    if (duel.a.uid === me.uid) return 'yours';
    if (duel.b && duel.b.uid !== me.uid) return 'full';
    if (!duel.b) {
      const b = { uid: me.uid, handle: me.handle, chips: null };
      tx.update(ref, { b });
      return { ...duel, b };
    }
    return duel;
  });
}

export async function submitChips(code: string, side: 'a' | 'b', current: DuelSide, chips: Chips): Promise<void> {
  const db = firebaseDb();
  if (!db) throw new Error('offline');
  await updateDoc(doc(db, 'duels', code), { [side]: { ...current, chips } });
}

export async function fetchDuel(code: string): Promise<OnlineDuel | null> {
  const db = firebaseDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, 'duels', code));
  return read(code, snap.data());
}

/** Live updates while waiting for a friend. Returns an unsubscribe function. */
export function watchDuel(code: string, onChange: (duel: OnlineDuel | null) => void, onError: () => void): () => void {
  const db = firebaseDb();
  if (!db) return () => {};
  return onSnapshot(
    doc(db, 'duels', code),
    (snap) => onChange(read(code, snap.data())),
    () => onError(),
  );
}
