import { Coordinates, Madhab as AdhanMadhab, PrayerTimes } from 'adhan';
import { buildCalcParams, OBLIGATORY } from '@/constants/app';
import type { AppLocation, PrayerKey, PrayerTimeEntry } from '@/domain/types';
import type { PrayerSettings } from '@/store/settingsStore';

/** Pure, offline computation (astronomical formulas via `adhan`) — no network needed. */
export function computePrayerTimes(
  location: Pick<AppLocation, 'latitude' | 'longitude'>,
  date: Date,
  settings: Pick<PrayerSettings, 'method' | 'madhab'>,
): PrayerTimeEntry[] {
  const params = buildCalcParams(settings.method);
  params.madhab = settings.madhab === 'hanafi' ? AdhanMadhab.Hanafi : AdhanMadhab.Shafi;
  const t = new PrayerTimes(new Coordinates(location.latitude, location.longitude), date, params);
  return [
    { key: 'fajr', time: t.fajr },
    { key: 'sunrise', time: t.sunrise },
    { key: 'dhuhr', time: t.dhuhr },
    { key: 'asr', time: t.asr },
    { key: 'maghrib', time: t.maghrib },
    { key: 'isha', time: t.isha },
  ];
}

export interface DaySchedule {
  today: PrayerTimeEntry[];
  /** The next obligatory prayer (may be tomorrow's Fajr after Isha). */
  next: PrayerTimeEntry;
  /** The last obligatory prayer whose time has begun, if any today. */
  current: PrayerKey | null;
}

export function buildSchedule(
  location: Pick<AppLocation, 'latitude' | 'longitude'>,
  now: Date,
  settings: Pick<PrayerSettings, 'method' | 'madhab'>,
): DaySchedule {
  const today = computePrayerTimes(location, now, settings);
  const obligatoryToday = today.filter((p) => (OBLIGATORY as readonly string[]).includes(p.key));

  const upcoming = obligatoryToday.find((p) => p.time.getTime() > now.getTime());
  let next: PrayerTimeEntry;
  if (upcoming) {
    next = upcoming;
  } else {
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12);
    const fajr = computePrayerTimes(location, tomorrow, settings)[0];
    next = fajr;
  }

  const started = obligatoryToday.filter((p) => p.time.getTime() <= now.getTime());
  const current = started.length ? started[started.length - 1].key : null;

  return { today, next, current };
}
