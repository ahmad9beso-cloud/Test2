const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** 12 → "١٢" */
export function toArabicIndic(value: number | string): string {
  return String(value).replace(/\d/g, (d) => ARABIC_INDIC[Number(d)]);
}

/** "١٢" → 12 (also accepts Latin digits) */
export function fromArabicIndic(value: string): number {
  const latin = value.replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d)));
  return parseInt(latin, 10);
}

/**
 * Normalises Arabic text for searching: strips tashkeel / Quranic marks / tatweel
 * and unifies alef, ya and ta-marbuta variants.
 */
export function normalizeArabic(input: string): string {
  return input
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿ]/g, '')
    .replace(/ـ/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

const JUZ_ORDINALS = [
  'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
  'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر',
  'الثامن عشر', 'التاسع عشر', 'العشرون', 'الحادي والعشرون', 'الثاني والعشرون', 'الثالث والعشرون',
  'الرابع والعشرون', 'الخامس والعشرون', 'السادس والعشرون', 'السابع والعشرون', 'الثامن والعشرون',
  'التاسع والعشرون', 'الثلاثون',
];

export function juzLabel(juz: number): string {
  const name = JUZ_ORDINALS[juz - 1];
  return name ? `الجزء ${name}` : `الجزء ${toArabicIndic(juz)}`;
}
