import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './storage';
import type { AppLocation, ReminderStyle } from '@/domain/types';
import type { CalcMethodId } from '@/constants/app';
import { FONT_SIZE_LIMITS } from '@/constants/app';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ClockFormat = 'h12' | 'h24';
export type Madhab = 'shafi' | 'hanafi';
export type AlertablePrayer = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface QuranSettings {
  fontSize: number;
  pageThemeId: 'classic' | 'paper' | 'sepia';
  /** Reader colour mode: follow the app theme or force light/dark. */
  readingMode: 'app' | 'light' | 'dark';
}

export interface AzkarSettings {
  autoNext: boolean;
  haptics: boolean;
}

export interface PrayerSettings {
  method: CalcMethodId;
  madhab: Madhab;
  alerts: Record<AlertablePrayer, boolean>;
}

export interface ReminderSettings {
  enabled: boolean;
  intervalMinutes: number;
  /** Minutes from midnight. */
  startMinutes: number;
  endMinutes: number;
  style: ReminderStyle;
}

interface SettingsData {
  onboardingDone: boolean;
  theme: ThemeMode;
  /** 12-hour with ص/م (default) or 24-hour clock. */
  clockFormat: ClockFormat;
  quran: QuranSettings;
  azkar: AzkarSettings;
  prayer: PrayerSettings;
  reminders: ReminderSettings;
  location: AppLocation | null;
}

interface SettingsActions {
  setTheme: (theme: ThemeMode) => void;
  setClockFormat: (format: ClockFormat) => void;
  patchQuran: (patch: Partial<QuranSettings>) => void;
  patchAzkar: (patch: Partial<AzkarSettings>) => void;
  patchPrayer: (patch: Partial<PrayerSettings>) => void;
  setPrayerAlert: (key: AlertablePrayer, on: boolean) => void;
  patchReminders: (patch: Partial<ReminderSettings>) => void;
  setLocation: (location: AppLocation | null) => void;
  completeOnboarding: () => void;
}

export interface SettingsState extends SettingsData, SettingsActions {
  /** True once persisted values have been read from storage. Not persisted. */
  hydrated: boolean;
}

export const defaultSettings: SettingsData = {
  onboardingDone: false,
  theme: 'system',
  clockFormat: 'h12',
  quran: { fontSize: FONT_SIZE_LIMITS.default, pageThemeId: 'classic', readingMode: 'app' },
  azkar: { autoNext: true, haptics: true },
  prayer: {
    method: 'MuslimWorldLeague',
    madhab: 'shafi',
    alerts: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
  },
  reminders: {
    enabled: false,
    intervalMinutes: 15,
    startMinutes: 8 * 60,
    endMinutes: 22 * 60,
    style: 'normal',
  },
  location: null,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      hydrated: false,
      setTheme: (theme) => set({ theme }),
      setClockFormat: (clockFormat) => set({ clockFormat }),
      patchQuran: (patch) => set((s) => ({ quran: { ...s.quran, ...patch } })),
      patchAzkar: (patch) => set((s) => ({ azkar: { ...s.azkar, ...patch } })),
      patchPrayer: (patch) => set((s) => ({ prayer: { ...s.prayer, ...patch } })),
      setPrayerAlert: (key, on) =>
        set((s) => ({ prayer: { ...s.prayer, alerts: { ...s.prayer.alerts, [key]: on } } })),
      patchReminders: (patch) => set((s) => ({ reminders: { ...s.reminders, ...patch } })),
      setLocation: (location) => set({ location }),
      completeOnboarding: () => set({ onboardingDone: true }),
    }),
    {
      name: 'sakinah.settings.v1',
      storage: persistStorage,
      // Bump the version so saved state from older builds merges through `merge`.
      version: 2,
      partialize: (s) => ({
        onboardingDone: s.onboardingDone,
        theme: s.theme,
        clockFormat: s.clockFormat,
        quran: s.quran,
        azkar: s.azkar,
        prayer: s.prayer,
        reminders: s.reminders,
        location: s.location,
      }),
      // Merge deeply so new settings added in future versions get their defaults.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SettingsData>;
        return {
          ...current,
          ...p,
          clockFormat: p.clockFormat ?? current.clockFormat,
          quran: { ...current.quran, ...p.quran },
          azkar: { ...current.azkar, ...p.azkar },
          prayer: {
            ...current.prayer,
            ...p.prayer,
            alerts: { ...current.prayer.alerts, ...p.prayer?.alerts },
          },
          reminders: { ...current.reminders, ...p.reminders },
        };
      },
      onRehydrateStorage: () => () => {
        useSettings.setState({ hydrated: true });
      },
    },
  ),
);
