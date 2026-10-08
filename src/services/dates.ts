import { toArabicIndic } from '@/utils/arabic';

const HIJRI_MONTHS = [
  'محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة',
];
const GREG_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/**
 * Tabular (arithmetical) Islamic calendar. Can differ by ±1 day from the Umm al-Qura
 * calendar, so it is used only if the platform Intl cannot provide the real calendar.
 */
function tabularHijri(date: Date): { year: number; month: number; day: number } {
  const jd =
    Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000) + 2440588;
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

function intlHijri(date: Date): { year: number; month: number; day: number } | null {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(date);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    const year = get('year');
    const month = get('month');
    const day = get('day');
    // Sanity check: the Hijri year must be in a plausible range, otherwise Intl fell back to Gregorian.
    if (year > 1300 && year < 1700 && month >= 1 && month <= 12 && day >= 1 && day <= 30) {
      return { year, month, day };
    }
  } catch {
    // Intl calendar not supported on this engine
  }
  return null;
}

export function formatHijri(date: Date): string {
  const h = intlHijri(date) ?? tabularHijri(date);
  return `${toArabicIndic(h.day)} ${HIJRI_MONTHS[h.month - 1]} ${toArabicIndic(h.year)} هـ`;
}

export function formatGregorian(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}، ${toArabicIndic(date.getDate())} ${GREG_MONTHS[date.getMonth()]} ${toArabicIndic(date.getFullYear())}`;
}

export function greetingForHour(): string {
  return 'السلام عليكم';
}
