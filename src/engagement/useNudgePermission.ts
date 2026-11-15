/** Whether Kip's reminders can reach the player, plus a one-tap way to turn them on. */
import * as Notifications from 'expo-notifications';
import { IosAuthorizationStatus } from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { requestNudgePermission } from './scheduler';

export type NudgePermission = 'granted' | 'off' | 'unknown';

export function useNudgePermission() {
  const [status, setStatus] = useState<NudgePermission>('unknown');
  const [canAskAgain, setCanAskAgain] = useState(true);

  const refresh = useCallback(() => {
    Notifications.getPermissionsAsync()
      .then((p) => {
        const ok = p.granted || p.ios?.status === IosAuthorizationStatus.PROVISIONAL;
        setStatus(ok ? 'granted' : 'off');
        setCanAskAgain(p.canAskAgain);
      })
      .catch(() => setStatus('unknown'));
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => sub.remove();
  }, [refresh]);

  /** Asks the system if it still can; otherwise opens this app's Settings page. */
  const turnOn = useCallback(async () => {
    if (canAskAgain) {
      await requestNudgePermission().catch(() => false);
      refresh();
    } else {
      Linking.openSettings().catch(() => {});
    }
  }, [canAskAgain, refresh]);

  return { status, turnOn };
}
