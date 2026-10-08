import { useEffect, useMemo, useState } from 'react';
import { useSettings } from '@/store/settingsStore';
import { buildSchedule, type DaySchedule } from '@/services/prayer';
import { dayKey } from '@/utils/time';
import type { AppLocation } from '@/domain/types';

export interface PrayerView {
  location: AppLocation | null;
  schedule: DaySchedule | null;
  /** Time zone to render times in (only for manually chosen cities). */
  displayZone?: string;
}

/**
 * Prayer schedule for the saved location. Recomputed only when the location, calculation
 * settings or day change, or when the "next prayer" time has just passed — not every second.
 */
export function usePrayerSchedule(now: Date): PrayerView {
  const location = useSettings((s) => s.location);
  const method = useSettings((s) => s.prayer.method);
  const madhab = useSettings((s) => s.prayer.madhab);
  const [version, setVersion] = useState(0);
  const day = dayKey(now);

  const schedule = useMemo(
    () => (location ? buildSchedule(location, new Date(), { method, madhab }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location, method, madhab, day, version],
  );

  useEffect(() => {
    if (schedule && now.getTime() >= schedule.next.time.getTime()) setVersion((v) => v + 1);
  }, [now, schedule]);

  return {
    location,
    schedule,
    displayZone: location?.mode === 'city' ? location.timeZone : undefined,
  };
}
