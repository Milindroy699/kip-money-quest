/** Applies the nudge plan as local notifications. Remote push (FCM) arrives in Phase 2. */
import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { Platform } from 'react-native';

import { planNudges, type NudgeContext } from './nudges';

let handlerSet = false;

function ensureHandler() {
  if (handlerSet) return;
  handlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNudgePermission(): Promise<boolean> {
  ensureHandler();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('kip', { name: 'Kip reminders', importance: AndroidImportance.DEFAULT });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const next = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: true } });
  return next.granted || next.ios?.status === IosAuthorizationStatus.PROVISIONAL;
}

/** Cancels everything and schedules the plan for the coming weeks. Returns how many were scheduled. */
export async function rescheduleNudges(ctx: NudgeContext): Promise<number> {
  ensureHandler();
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && permission.ios?.status !== IosAuthorizationStatus.PROVISIONAL) return 0;

  await Notifications.cancelAllScheduledNotificationsAsync();
  const plan = planNudges(ctx);
  for (const nudge of plan) {
    const [y, m, d] = nudge.day.split('-').map(Number);
    const date = new Date(y, m - 1, d, nudge.hour, nudge.minute, 0);
    if (date.getTime() <= Date.now()) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: nudge.title, body: nudge.body, data: { kind: nudge.kind } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: 'kip' },
    });
  }
  return (await Notifications.getAllScheduledNotificationsAsync()).length;
}
