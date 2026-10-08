import categoriesJson from '../azkar/categories.json';
import azkarJson from '../azkar/azkar.json';
import type { AzkarCategory, Dhikr } from '@/domain/types';

const categories = categoriesJson as AzkarCategory[];
const items = azkarJson as Dhikr[];

/** Single entry point for Azkar data. Add content by editing src/data/azkar/*.json. */
export const azkarRepository = {
  getCategories(): AzkarCategory[] {
    return categories.filter((c) => c.visible);
  },

  getCategory(id: string): AzkarCategory | undefined {
    return categories.find((c) => c.id === id);
  },

  getItems(categoryId: string): Dhikr[] {
    return items
      .filter((i) => i.categoryIds.includes(categoryId))
      .sort((a, b) => a.order - b.order);
  },

  countItems(categoryId: string): number {
    return items.filter((i) => i.categoryIds.includes(categoryId)).length;
  },

  /** All items — used by the reminder scheduler to pick notification text. */
  getAllItems(): Dhikr[] {
    return items;
  },
};
