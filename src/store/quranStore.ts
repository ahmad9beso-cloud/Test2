import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './storage';
import type { Bookmark, ReadingPosition } from '@/domain/types';

interface QuranState {
  position: ReadingPosition | null;
  bookmarks: Bookmark[];
  hydrated: boolean;
  setPosition: (position: Omit<ReadingPosition, 'updatedAt'>) => void;
  /** Toggles a whole-page bookmark. Returns true if it is now bookmarked. */
  togglePageBookmark: (page: number) => boolean;
  /** Toggles an ayah bookmark. Returns true if it is now bookmarked. */
  toggleAyahBookmark: (page: number, surah: number, ayah: number) => boolean;
  removeBookmark: (id: string) => void;
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const useQuran = create<QuranState>()(
  persist(
    (set, get) => ({
      position: null,
      bookmarks: [],
      hydrated: false,

      setPosition: (position) => set({ position: { ...position, updatedAt: Date.now() } }),

      togglePageBookmark: (page) => {
        const existing = get().bookmarks.find((b) => b.page === page && b.surah === undefined);
        if (existing) {
          set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== existing.id) }));
          return false;
        }
        set((s) => ({
          bookmarks: [{ id: newId(), page, createdAt: Date.now() }, ...s.bookmarks],
        }));
        return true;
      },

      toggleAyahBookmark: (page, surah, ayah) => {
        const existing = get().bookmarks.find((b) => b.surah === surah && b.ayah === ayah);
        if (existing) {
          set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== existing.id) }));
          return false;
        }
        set((s) => ({
          bookmarks: [{ id: newId(), page, surah, ayah, createdAt: Date.now() }, ...s.bookmarks],
        }));
        return true;
      },

      removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
    }),
    {
      name: 'sakinah.quran.v1',
      storage: persistStorage,
      version: 1,
      partialize: (s) => ({ position: s.position, bookmarks: s.bookmarks }),
      onRehydrateStorage: () => () => {
        useQuran.setState({ hydrated: true });
      },
    },
  ),
);
