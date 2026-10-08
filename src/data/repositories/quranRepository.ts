import manifestJson from '../quran/manifest.json';
import surahsJson from '../quran/surahs.json';
import { pageLoaders } from '../quran/pageLoaders';
import type { Ayah, QuranManifest, QuranPageData, Surah } from '@/domain/types';
import { normalizeArabic } from '@/utils/arabic';

/**
 * Single entry point for Quran data. Screens never import JSON directly.
 * To plug in the full mushaf, run `npm run data:quran` (see README) — this file does not change.
 */

const manifest = manifestJson as QuranManifest;
const surahs = surahsJson as Surah[];
const surahById = new Map(surahs.map((s) => [s.id, s]));

const pageCache = new Map<number, QuranPageData>();
const CACHE_LIMIT = 12;

export interface SearchHit {
  surah: number;
  ayah: number;
  page: number;
  text: string;
}

export const quranRepository = {
  getManifest(): QuranManifest {
    return manifest;
  },

  /** True when at least one page of data is bundled. */
  hasData(): boolean {
    return manifest.pages.length > 0;
  },

  /** Page numbers the reader can show (all 604 once the full data is imported). */
  getPageNumbers(): number[] {
    return manifest.complete
      ? Array.from({ length: manifest.totalPages }, (_, i) => i + 1)
      : manifest.pages;
  },

  getSurahs(): Surah[] {
    return surahs;
  },

  getSurah(id: number): Surah | undefined {
    return surahById.get(id);
  },

  /** Loads a page lazily and keeps a small LRU cache. Returns null when the page isn't bundled. */
  getPage(page: number): QuranPageData | null {
    const cached = pageCache.get(page);
    if (cached) {
      pageCache.delete(page);
      pageCache.set(page, cached);
      return cached;
    }
    const loader = pageLoaders[page];
    if (!loader) return null;
    const data = loader();
    pageCache.set(page, data);
    if (pageCache.size > CACHE_LIMIT) {
      const oldest = pageCache.keys().next().value;
      if (oldest !== undefined) pageCache.delete(oldest);
    }
    return data;
  },

  /** Page that contains the given ayah (scans bundled pages; fine for 604 small JSON files). */
  findPageOfAyah(surah: number, ayah: number): number | null {
    for (const p of manifest.pages) {
      const data = this.getPage(p);
      if (data?.ayahs.some((a) => a.surah === surah && a.ayah === ayah)) return p;
    }
    return null;
  },

  /** Every ayah in bundled data, in mushaf order, with its page. */
  getAllAyahs(): { ayah: Ayah; page: number }[] {
    const out: { ayah: Ayah; page: number }[] = [];
    for (const p of manifest.pages) {
      const data = this.getPage(p);
      data?.ayahs.forEach((ayah) => out.push({ ayah, page: p }));
    }
    return out;
  },

  /** Diacritics-insensitive search. Yields to the UI thread between batches of pages. */
  async search(query: string, limit = 50): Promise<SearchHit[]> {
    const q = normalizeArabic(query);
    if (q.length < 2) return [];
    const hits: SearchHit[] = [];
    let processed = 0;
    for (const p of manifest.pages) {
      const data = this.getPage(p);
      if (data) {
        for (const a of data.ayahs) {
          if (normalizeArabic(a.text).includes(q)) {
            hits.push({ surah: a.surah, ayah: a.ayah, page: p, text: a.text });
            if (hits.length >= limit) return hits;
          }
        }
      }
      if (++processed % 40 === 0) await new Promise((r) => setTimeout(r, 0));
    }
    return hits;
  },
};
