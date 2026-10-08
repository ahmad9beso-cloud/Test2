import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { azkarRepository } from '@/data/repositories/azkarRepository';
import { computePrayerTimes } from '@/services/prayer';
import { PRAYER_LABELS, APP_NAME } from '@/constants/app';
import type { AppLocation } from '@/domain/types';
import type { PrayerSettings, ReminderSettings, AlertablePrayer } from '@/store/settingsStore';

/**
 * Local notifications only (no server, no push). The OS decides final delivery:
 * we never try to bypass Doze, lock-screen or Do-Not-Disturb rules.
 */

export const CHANNELS = {
  normal: 'azkar-normal',
  headsUp: 'azkar-heads-up',
  prayer: 'prayer-alerts',
} as const;

/** Above this many slots per day we stop using repeating daily triggers and schedule a rolling window. */
const MAX_DAILY_SLOTS = 96;
/** Max one-shot notifications scheduled in rolling mode (re-planned every time the app opens). */
const MAX_ROLLING = 180;
const PRAYER_DAYS_AHEAD = 3;

export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function setupChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNELS.normal, {
    name: 'تذكيرات الأذكار (عادي)',
    importance: Notifications.AndroidImportance.DEFAULT,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    vibrationPattern: [0, 120],
  });
  await Notifications.setNotificationChannelAsync(CHANNELS.headsUp, {
    name: 'تذكيرات الأذكار (بارز)',
    importance: Notifications.AndroidImportance.HIGH,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    vibrationPattern: [0, 200, 100, 200],
  });
  await Notifications.setNotificationChannelAsync(CHANNELS.prayer, {
    name: 'تنبيهات الصلاة',
    importance: Notifications.AndroidImportance.HIGH,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export async function getNotificationPermission(): Promise<PermissionState> {
  const p = await Notifications.getPermissionsAsync();
  if (p.granted) return 'granted';
  return p.canAskAgain ? 'undetermined' : 'denied';
}

/** Returns true when notifications are allowed after the request. */
export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

/** Minutes-from-midnight of each reminder inside [start, end]; the window may cross midnight. */
export function computeSlots(startMinutes: number, endMinutes: number, intervalMinutes: number): number[] {
  const interval = Math.max(1, Math.floor(intervalMinutes));
  const span = (endMinutes - startMinutes + 1440) % 1440;
  const slots: number[] = [];
  for (let offset = 0; offset <= span; offset += interval) {
    slots.push((startMinutes + offset) % 1440);
  }
  return slots;
}

function bodyFor(index: number): string {
  const items = azkarRepository.getAllItems();
  if (items.length === 0) return 'حان وقت أذكارك. افتح التطبيق لمتابعة ورد اليوم.';
  const text = items[index % items.length].text;
  return text.length > 140 ? `${text.slice(0, 137)}…` : text;
}

export interface SyncReport {
  status: 'ok' | 'disabled' | 'no-permission';
  /** Number of reminder notifications currently scheduled. */
  scheduledReminders: number;
  /** True when intervals are so short that the plan only covers the near future until the app is opened again. */
  rolling: boolean;
  scheduledPrayerAlerts: number;
}

interface SyncInput {
  reminders: ReminderSettings;
  prayer: PrayerSettings;
  location: AppLocation | null;
}

/** Cancels everything and re-plans from the current settings. Idempotent, safe to call often. */
export async function syncNotifications({ reminders, prayer, location }: SyncInput): Promise<SyncReport> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const anyPrayerAlert = Object.values(prayer.alerts).some(Boolean);
  if (!reminders.enabled && !anyPrayerAlert) {
    return { status: 'disabled', scheduledReminders: 0, rolling: false, scheduledPrayerAlerts: 0 };
  }
  if ((await getNotificationPermission()) !== 'granted') {
    return { status: 'no-permission', scheduledReminders: 0, rolling: false, scheduledPrayerAlerts: 0 };
  }

  let scheduledReminders = 0;
  let rolling = false;

  if (reminders.enabled) {
    const channelId = reminders.style === 'heads-up' ? CHANNELS.headsUp : CHANNELS.normal;
    const slots = computeSlots(reminders.startMinutes, reminders.endMinutes, reminders.intervalMinutes);

    if (slots.length <= MAX_DAILY_SLOTS) {
      for (let i = 0; i < slots.length; i++) {
        await Notifications.scheduleNotificationAsync({
          content: { title: APP_NAME, body: bodyFor(i), data: { route: '/azkar' } },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: Math.floor(slots[i] / 60),
            minute: slots[i] % 60,
            channelId,
          },
        });
        scheduledReminders++;
      }
    } else {
      // Very frequent reminders: schedule the next N occurrences; refreshed on every app open.
      rolling = true;
      const now = Date.now();
      const times: number[] = [];
      for (let day = 0; day < 3 && times.length < MAX_ROLLING; day++) {
        for (const slot of slots) {
          const d = new Date();
          d.setDate(d.getDate() + day);
          d.setHours(Math.floor(slot / 60), slot % 60, 0, 0);
          if (d.getTime() > now + 5000) times.push(d.getTime());
        }
      }
      times.sort((a, b) => a - b);
      for (let i = 0; i < Math.min(times.length, MAX_ROLLING); i++) {
        await Notifications.scheduleNotificationAsync({
          content: { title: APP_NAME, body: bodyFor(i), data: { route: '/azkar' } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(times[i]), channelId },
        });
        scheduledReminders++;
      }
    }
  }

  let scheduledPrayerAlerts = 0;
  if (anyPrayerAlert && location) {
    for (let day = 0; day < PRAYER_DAYS_AHEAD; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      const entries = computePrayerTimes(location, date, prayer);
      for (const entry of entries) {
        if (entry.key === 'sunrise') continue;
        if (!prayer.alerts[entry.key as AlertablePrayer]) continue;
        if (entry.time.getTime() <= Date.now() + 5000) continue;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `حان موعد صلاة ${PRAYER_LABELS[entry.key]}`,
            body: location.label,
            data: { route: '/' },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: entry.time, channelId: CHANNELS.prayer },
        });
        scheduledPrayerAlerts++;
      }
    }
  }

  return { status: 'ok', scheduledReminders, rolling, scheduledPrayerAlerts };
}

/** Fires one notification a few seconds from now so the user can verify the whole pipeline. */
export async function sendTestNotification(style: 'normal' | 'heads-up', seconds = 5): Promise<boolean> {
  if ((await getNotificationPermission()) !== 'granted') return false;
  const items = azkarRepository.getAllItems();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${APP_NAME} · تجربة التذكير`,
      body: items.length ? bodyFor(0) : 'هذا إشعار تجريبي للتأكد من عمل التذكيرات.',
      data: { route: '/azkar' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      channelId: style === 'heads-up' ? CHANNELS.headsUp : CHANNELS.normal,
    },
  });
  return true;
}
