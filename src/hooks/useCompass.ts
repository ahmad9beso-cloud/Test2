import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { angleDelta } from '@/utils/time';

export type CompassStatus =
  | 'loading'
  | 'ready'
  /** The device has no usable heading/magnetometer sensor. */
  | 'unavailable';

/** 0 = unknown, 1 = low, 2 = medium, 3 = high. */
export type CompassAccuracy = 0 | 1 | 2 | 3;

export interface CompassState {
  /** Smoothed, unwrapped heading in degrees clockwise from north. Continuous (may exceed 0–360). */
  heading: number;
  status: CompassStatus;
  accuracy: CompassAccuracy;
  /** True when heading is relative to true north (otherwise magnetic north). */
  trueNorth: boolean;
}

const SMOOTHING = 0.42;

/**
 * Real device heading.
 * 1. Preferred: the OS fused heading from expo-location (tilt-compensated, reports calibration accuracy).
 * 2. Fallback: raw magnetometer, assuming the phone is held flat.
 * The value is low-pass filtered along the shortest arc and kept continuous so the dial never spins at 359°→0°.
 */
export function useCompass(enabled = true): CompassState {
  const [state, setState] = useState<CompassState>({ heading: 0, status: 'loading', accuracy: 0, trueNorth: false });
  const smoothed = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let removeHeading: (() => void) | undefined;
    let magSub: { remove: () => void } | undefined;

    const push = (raw: number, accuracy: CompassAccuracy, trueNorth: boolean) => {
      const target = ((raw % 360) + 360) % 360;
      if (smoothed.current === null) {
        smoothed.current = target;
      } else {
        const current = smoothed.current;
        const next = current + angleDelta(((current % 360) + 360) % 360, target) * SMOOTHING;
        smoothed.current = next;
      }
      if (!cancelled) {
        setState({ heading: smoothed.current, status: 'ready', accuracy, trueNorth });
      }
    };

    const startMagnetometer = async () => {
      try {
        if (!(await Magnetometer.isAvailableAsync())) {
          if (!cancelled) setState((s) => ({ ...s, status: 'unavailable' }));
          return;
        }
        Magnetometer.setUpdateInterval(50);
        magSub = Magnetometer.addListener(({ x, y }) => {
          // Device flat, screen up: heading measured from the +y axis towards +x.
          const deg = (Math.atan2(-x, y) * 180) / Math.PI;
          push(deg, 0, false);
        });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, status: 'unavailable' }));
      }
    };

    const start = async () => {
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.granted) {
          const sub = await Location.watchHeadingAsync((h) => {
            const useTrue = h.trueHeading >= 0;
            // expo-location reports accuracy as an error estimate in degrees (lower = better),
            // mapped here to 0 (unknown) … 3 (tight). Never treated as a calibration flag.
            const acc = (h.accuracy == null ? 0 : h.accuracy <= 5 ? 3 : h.accuracy <= 15 ? 2 : 1) as CompassAccuracy;
            push(useTrue ? h.trueHeading : h.magHeading, acc, useTrue);
          });
          if (cancelled) sub.remove();
          else removeHeading = () => sub.remove();
          return;
        }
      } catch {
        // fall through to the magnetometer
      }
      await startMagnetometer();
    };

    start();
    return () => {
      cancelled = true;
      removeHeading?.();
      magSub?.remove();
      smoothed.current = null;
    };
  }, [enabled]);

  return state;
}
