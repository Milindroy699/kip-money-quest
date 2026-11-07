/** Re-plans local nudges whenever the app opens or the player is active. */
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useGame } from '../state/game';
import { rescheduleNudges } from './scheduler';

export function useNudgeScheduler() {
  const onboarded = useGame((s) => s.profile.onboarded);
  const lastActiveDay = useGame((s) => s.streak.lastActiveDay);
  const reminder = useGame((s) => s.profile.reminder);
  const mute = useGame((s) => s.profile.schoolHoursMute);

  useEffect(() => {
    if (!onboarded) return;
    const plan = () => {
      const s = useGame.getState();
      const now = new Date();
      rescheduleNudges({
        today: s.today(),
        nowMinutes: now.getHours() * 60 + now.getMinutes(),
        reminder: s.profile.reminder,
        activeToday: s.streak.lastActiveDay === s.today(),
        streak: s.streak.count,
        playerName: s.profile.name,
        schoolHoursMute: s.profile.schoolHoursMute,
      }).catch(() => {});
    };
    plan();
    const sub = AppState.addEventListener('change', (state) => state === 'active' && plan());
    return () => sub.remove();
  }, [onboarded, lastActiveDay, reminder, mute]);
}

/** Tapping a nudge opens the right place: the Sunday weekly nudge opens the parent report. */
export function useNudgeTapRouting() {
  const onboarded = useGame((s) => s.profile.onboarded);
  const last = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!last || !onboarded || last.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const kind = (last.notification.request.content.data as { kind?: string } | undefined)?.kind;
    if (kind === 'weekly') router.push('/parent');
    Notifications.clearLastNotificationResponseAsync().catch(() => {});
  }, [last, onboarded]);
}
