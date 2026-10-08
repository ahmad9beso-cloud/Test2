import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './storage';
import { dayKey } from '@/utils/time';

export interface CategoryProgress {
  /** Local calendar day this progress belongs to; a new day starts from zero. */
  day: string;
  /** Index of the dhikr currently shown. */
  index: number;
  /** itemId → completed repetitions. */
  counts: Record<string, number>;
}

interface AzkarState {
  progress: Record<string, CategoryProgress>;
  hydrated: boolean;
  /** Adds one repetition (capped at `target`). Returns the new count. */
  increment: (categoryId: string, itemId: string, target: number) => number;
  resetItem: (categoryId: string, itemId: string) => void;
  resetCategory: (categoryId: string) => void;
  setIndex: (categoryId: string, index: number) => void;
}

const fresh = (): CategoryProgress => ({ day: dayKey(), index: 0, counts: {} });

/** Returns today's progress for a category (stale days are treated as empty). */
export function readProgress(
  progress: Record<string, CategoryProgress>,
  categoryId: string,
): CategoryProgress {
  const p = progress[categoryId];
  return p && p.day === dayKey() ? p : fresh();
}

export const useAzkar = create<AzkarState>()(
  persist(
    (set, get) => ({
      progress: {},
      hydrated: false,

      increment: (categoryId, itemId, target) => {
        const current = readProgress(get().progress, categoryId);
        const next = Math.min(target, (current.counts[itemId] ?? 0) + 1);
        set((s) => ({
          progress: {
            ...s.progress,
            [categoryId]: { ...current, counts: { ...current.counts, [itemId]: next } },
          },
        }));
        return next;
      },

      resetItem: (categoryId, itemId) => {
        const current = readProgress(get().progress, categoryId);
        const counts = { ...current.counts };
        delete counts[itemId];
        set((s) => ({ progress: { ...s.progress, [categoryId]: { ...current, counts } } }));
      },

      resetCategory: (categoryId) =>
        set((s) => ({ progress: { ...s.progress, [categoryId]: fresh() } })),

      setIndex: (categoryId, index) => {
        const current = readProgress(get().progress, categoryId);
        set((s) => ({ progress: { ...s.progress, [categoryId]: { ...current, index } } }));
      },
    }),
    {
      name: 'sakinah.azkar.v1',
      storage: persistStorage,
      version: 1,
      partialize: (s) => ({ progress: s.progress }),
      onRehydrateStorage: () => () => {
        useAzkar.setState({ hydrated: true });
      },
    },
  ),
);
