import { useMemo } from 'react';
import { quranRepository } from '@/data/repositories/quranRepository';
import { dayKey } from '@/utils/time';
import type { Ayah } from '@/domain/types';

export interface DailyAyah {
  ayah: Ayah;
  page: number;
  surahName: string;
}

/** Deterministic "ayah of the day" drawn only from the bundled Quran data (never hard-coded in UI). */
export function useDailyAyah(now: Date): DailyAyah | null {
  const day = dayKey(now);
  return useMemo(() => {
    const all = quranRepository.getAllAyahs();
    if (all.length === 0) return null;
    const dayNumber = Math.floor(new Date(`${day}T00:00:00Z`).getTime() / 86400000);
    const pick = all[dayNumber % all.length];
    return {
      ayah: pick.ayah,
      page: pick.page,
      surahName: quranRepository.getSurah(pick.ayah.surah)?.nameAr ?? '',
    };
  }, [day]);
}
