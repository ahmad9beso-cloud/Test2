import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { useSettings } from '@/store/settingsStore';
import { detectGpsLocation, LOCATION_FAILURE_MESSAGES, locationFromCity, type LocationFailure } from '@/services/location';
import type { City } from '@/data/cities';

/** Shared by onboarding and the location screen. Never throws; failures become a readable message. */
export function useLocationActions() {
  const setLocation = useSettings((s) => s.setLocation);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<LocationFailure | null>(null);

  const useGps = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    setFailure(null);
    const result = await detectGpsLocation();
    setBusy(false);
    if (result.ok) {
      setLocation(result.location);
      return true;
    }
    setFailure(result.reason);
    return false;
  }, [setLocation]);

  const chooseCity = useCallback(
    (city: City) => {
      setFailure(null);
      setLocation(locationFromCity(city));
    },
    [setLocation],
  );

  return {
    busy,
    failure,
    failureMessage: failure ? LOCATION_FAILURE_MESSAGES[failure] : null,
    canOpenSettings: failure === 'blocked' || failure === 'services-off',
    openSystemSettings: () => Linking.openSettings().catch(() => {}),
    useGps,
    chooseCity,
  };
}
