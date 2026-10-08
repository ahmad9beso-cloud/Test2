import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSettings } from '@/store/settingsStore';
import { syncNotifications } from '@/services/notifications';

/**
 * Keeps scheduled notifications in line with settings: runs when relevant settings change
 * (debounced) and whenever the app returns to the foreground (re-plans rolling windows).
 */
export function useNotificationSync(): void {
  const hydrated = useSettings((s) => s.hydrated);
  const onboardingDone = useSettings((s) => s.onboardingDone);
  const reminders = useSettings((s) => s.reminders);
  const prayer = useSettings((s) => s.prayer);
  const location = useSettings((s) => s.location);

  useEffect(() => {
    if (!hydrated || !onboardingDone) return;
    const run = () => {
      syncNotifications({ reminders, prayer, location }).catch(() => {});
    };
    const timer = setTimeout(run, 400);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [hydrated, onboardingDone, reminders, prayer, location]);
}
