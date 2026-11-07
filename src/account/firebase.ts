/** Firebase (JS SDK), created on first use and only when configured. The session persists in MMKV. */
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';

import { mmkvStorage } from '../state/storage';
import { cloudConfigured, FIREBASE_CONFIG } from './config';

/** Storage shape Firebase's React Native persistence expects. */
interface AsyncKeyValue {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Metro resolves firebase/auth to its React Native build, which exports this; the web typings don't list it.
const { getReactNativePersistence } = FirebaseAuth as unknown as { getReactNativePersistence: (storage: AsyncKeyValue) => Persistence };

const storage: AsyncKeyValue = {
  getItem: async (key) => (await mmkvStorage.getItem(key)) ?? null,
  setItem: async (key, value) => {
    await mmkvStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    await mmkvStorage.removeItem(key);
  },
};

let auth: Auth | null = null;
let db: Firestore | null = null;

function app(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG as Record<string, string>);
}

/** The Firebase Auth instance, or null when the project isn't configured. */
export function firebaseAuth(): Auth | null {
  if (!cloudConfigured) return null;
  if (auth) return auth;
  try {
    auth = initializeAuth(app(), { persistence: getReactNativePersistence(storage) });
  } catch (e) {
    // Fast refresh re-runs this module while Firebase keeps its instance. Anything else is a real problem.
    if ((e as { code?: string }).code !== 'auth/already-initialized') throw e;
    auth = getAuth(app());
  }
  return auth;
}

/** Firestore, or null when the project isn't configured. Long-polling detection suits React Native networking. */
export function firebaseDb(): Firestore | null {
  if (!cloudConfigured) return null;
  if (db) return db;
  try {
    db = initializeFirestore(app(), { experimentalAutoDetectLongPolling: true });
  } catch {
    db = getFirestore(app());
  }
  return db;
}
