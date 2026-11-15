/** What happens after someone signs in, out, or deletes their account. */
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { persistedFields, useGame, type GameState, type LinkedAccount } from '../state/game';
import { cloudConfigured } from './config';
import { deleteCloudAccount, signOutEverywhere, type Identity } from './signIn';
import { chooseOnSignIn, deleteProgress, pullProgress, pushProgress, recordConsent, restoredState, snapshotOf } from './sync';

/**
 * Links the account. With the cloud: a phone with less progress than the cloud copy restores it
 * (new or reset phone); otherwise this phone's progress is uploaded.
 */
export async function afterSignIn(id: Identity, holder: LinkedAccount['holder']): Promise<'restored' | 'saved' | 'local'> {
  const account: LinkedAccount = { provider: id.provider, uid: id.uid, name: id.name, holder, cloud: id.cloud, consentAt: new Date().toISOString() };
  useGame.getState().linkAccount(account);
  if (!id.cloud) return 'local';
  await recordConsent(id.uid, holder, useGame.getState().profile.age).catch(() => {});
  const g = useGame.getState();
  const remote = await pullProgress(id.uid).catch(() => null);
  if (remote && chooseOnSignIn({ xp: g.xp, lessonsDone: Object.keys(g.lessons).length }, remote) === 'restore') {
    useGame.setState({ ...(restoredState(remote) as Partial<GameState>), account });
    return 'restored';
  }
  await pushProgress(id.uid, snapshotOf(persistedFields(useGame.getState()))).catch(() => {});
  return 'saved';
}

/** Signs out. Progress stays on this phone. */
export async function signOutAccount(): Promise<void> {
  await signOutEverywhere(useGame.getState().account?.provider);
  useGame.getState().unlinkAccount();
}

/** Deletes the cloud copy and the account. Progress stays on this phone. */
export async function deleteAccount(): Promise<'deleted' | 'signInAgain'> {
  const account = useGame.getState().account;
  if (account?.cloud) {
    await deleteProgress(account.uid).catch(() => {});
    const result = await deleteCloudAccount();
    if (result === 'signInAgain') return result;
  }
  await signOutEverywhere(account?.provider);
  useGame.getState().unlinkAccount();
  return 'deleted';
}

/** Keeps the cloud copy current: uploads a few seconds after progress changes, and when the app goes to the background. */
export function useProgressBackup() {
  useEffect(() => {
    if (!cloudConfigured) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last = '';
    const push = () => {
      const s = useGame.getState();
      if (!s.account?.cloud) return;
      const snap = snapshotOf(persistedFields(s));
      if (snap.data === last) return;
      pushProgress(s.account.uid, snap)
        .then(() => {
          last = snap.data;
        })
        .catch(() => {}); // offline or session still restoring: the next change retries
    };
    const unsubscribe = useGame.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(push, 8000);
    });
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'background') push();
    });
    return () => {
      unsubscribe();
      appState.remove();
      clearTimeout(timer);
    };
  }, []);
}
