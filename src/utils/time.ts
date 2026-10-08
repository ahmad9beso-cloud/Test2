const pad = (n: number) => String(n).padStart(2, '0');

/** HH:MM (24h) or h:MM with a ص / م suffix (12h) in the device time zone, or in `timeZone` when given. */
export function formatClock(date: Date, timeZone?: string, format: 'h12' | 'h24' = 'h24'): string {
  const fmt = (d: Date): string => {
    if (format === 'h12') {
      const h24 = d.getHours();
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      return `${h12}:${pad(d.getMinutes())} ${h24 < 12 ? 'ص' : 'م'}`;
    }
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  if (timeZone) {
    try {
      // Format in the target zone by shifting via its offset, then read the fields back.
      const parts = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
      }).formatToParts(date);
      const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0');
      const shifted = new Date(date);
      shifted.setHours(get('hour'), get('minute'), 0, 0);
      return fmt(shifted);
    } catch {
      // fall through to device time
    }
  }
  return fmt(date);
}

/** 5025 seconds → "01:23:45" */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/** Local calendar day key, e.g. "2026-10-06" — used to reset daily azkar progress. */
export function dayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function minutesToLabel(minutes: number, format: 'h12' | 'h24' = 'h24'): string {
  if (format === 'h12') {
    const h24 = Math.floor(minutes / 60) % 24;
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${pad(minutes % 60)} ${h24 < 12 ? 'ص' : 'م'}`;
  }
  return `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;
}

/** Shortest signed angular difference b - a in degrees, in (-180, 180]. */
export function angleDelta(a: number, b: number): number {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}
