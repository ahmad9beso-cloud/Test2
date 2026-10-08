/**
 * Domain models. UI, services and data repositories all speak these types,
 * so replacing/adding data (Quran, Azkar) never touches the screens.
 */

// ───────────── Quran ─────────────

export interface Surah {
  id: number;
  nameAr: string;
  ayahCount: number;
  /** Render the Basmala line before the first ayah (false for Al-Fatiha and At-Tawbah). */
  bismillahPre: boolean;
  /** Mushaf page on which the surah starts. */
  startPage: number;
}

export interface Ayah {
  surah: number;
  ayah: number;
  text: string;
}

export interface QuranPageData {
  page: number;
  juz: number;
  ayahs: Ayah[];
}

export interface QuranManifest {
  /** Total pages of the mushaf the data is paginated for (604 for the Madinah mushaf). */
  totalPages: number;
  /** Pages that actually have data bundled in the app. */
  pages: number[];
  /** True only when every page 1..totalPages is present. */
  complete: boolean;
  /** True while the bundled data is the small verification sample. */
  sample: boolean;
}

export interface Bookmark {
  id: string;
  page: number;
  /** Present for ayah bookmarks, absent for whole-page bookmarks. */
  surah?: number;
  ayah?: number;
  createdAt: number;
}

export interface ReadingPosition {
  page: number;
  surah?: number;
  ayah?: number;
  updatedAt: number;
}

// ───────────── Azkar ─────────────

export interface AzkarCategory {
  id: string;
  title: string;
  /** Hidden categories exist in the data model but are not listed yet. */
  visible: boolean;
}

export interface DhikrEvidence {
  /** Text of the hadith / ayah that is the evidence. */
  text?: string;
  narrator?: string;
  source?: string;
  grade?: string;
}

export interface Dhikr {
  id: string;
  categoryIds: string[];
  order: number;
  text: string;
  /** Required repetitions. */
  count: number;
  virtue?: string;
  evidence?: DhikrEvidence;
}

// ───────────── Location & prayer ─────────────

export interface AppLocation {
  mode: 'gps' | 'city';
  latitude: number;
  longitude: number;
  label: string;
  /** IANA time zone, used to display times of a manually chosen city. */
  timeZone?: string;
  cityId?: string;
  updatedAt: number;
}

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeEntry {
  key: PrayerKey;
  time: Date;
}

export type ReminderStyle = 'normal' | 'heads-up';
