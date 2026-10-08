import * as Location from 'expo-location';
import type { AppLocation } from '@/domain/types';
import type { City } from '@/data/cities';

export type LocationFailure = 'denied' | 'blocked' | 'services-off' | 'timeout' | 'error';
export type LocationResult =
  | { ok: true; location: AppLocation }
  | { ok: false; reason: LocationFailure };

export const LOCATION_FAILURE_MESSAGES: Record<LocationFailure, string> = {
  denied: 'لم يتم السماح بالوصول إلى الموقع. يمكنك اختيار مدينتك يدوياً.',
  blocked: 'صلاحية الموقع مغلقة من إعدادات النظام. فعّلها من إعدادات التطبيق أو اختر مدينتك يدوياً.',
  'services-off': 'خدمة الموقع (GPS) متوقفة على جهازك. فعّلها أو اختر مدينتك يدوياً.',
  timeout: 'تعذّر تحديد موقعك في الوقت المناسب. جرّب مرة أخرى أو اختر مدينتك يدوياً.',
  error: 'حدث خطأ أثناء تحديد الموقع. يمكنك اختيار مدينتك يدوياً.',
};

export function locationFromCity(city: City): AppLocation {
  return {
    mode: 'city',
    cityId: city.id,
    latitude: city.latitude,
    longitude: city.longitude,
    label: city.nameAr,
    timeZone: city.timeZone,
    updatedAt: Date.now(),
  };
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function labelFor(latitude: number, longitude: number): Promise<string> {
  try {
    const [place] = await withTimeout(Location.reverseGeocodeAsync({ latitude, longitude }), 5000);
    const name = place?.city ?? place?.subregion ?? place?.region;
    if (name) return name;
  } catch {
    // reverse geocoding needs network; fall back to a neutral label
  }
  return 'موقعي الحالي';
}

/** Asks for permission (if needed) and reads the current position. Never throws. */
export async function detectGpsLocation(): Promise<LocationResult> {
  try {
    let perm = await Location.getForegroundPermissionsAsync();
    if (!perm.granted) {
      if (!perm.canAskAgain) return { ok: false, reason: 'blocked' };
      perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return { ok: false, reason: perm.canAskAgain ? 'denied' : 'blocked' };
    }
    if (!(await Location.hasServicesEnabledAsync())) return { ok: false, reason: 'services-off' };

    let pos = await Location.getLastKnownPositionAsync();
    if (!pos) {
      pos = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        20000,
      );
    }
    const { latitude, longitude } = pos.coords;
    return {
      ok: true,
      location: {
        mode: 'gps',
        latitude,
        longitude,
        label: await labelFor(latitude, longitude),
        updatedAt: Date.now(),
      },
    };
  } catch (e) {
    return { ok: false, reason: e instanceof Error && e.message === 'timeout' ? 'timeout' : 'error' };
  }
}

/**
 * Silent refresh used at app start: only when permission is already granted,
 * the saved location came from GPS and is older than `maxAgeMs`.
 */
export async function refreshGpsIfStale(
  current: AppLocation | null,
  maxAgeMs = 6 * 3600 * 1000,
): Promise<AppLocation | null> {
  if (!current || current.mode !== 'gps' || Date.now() - current.updatedAt < maxAgeMs) return null;
  try {
    const perm = await Location.getForegroundPermissionsAsync();
    if (!perm.granted || !(await Location.hasServicesEnabledAsync())) return null;
    const pos = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
      15000,
    );
    return {
      ...current,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}
