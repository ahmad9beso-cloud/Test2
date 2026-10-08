import { CalculationMethod } from 'adhan';

export const APP_NAME = 'سكينة';

export const REMINDER_INTERVALS: { minutes: number; label: string }[] = [
  { minutes: 1, label: 'كل دقيقة' },
  { minutes: 5, label: 'كل 5 دقائق' },
  { minutes: 10, label: 'كل 10 دقائق' },
  { minutes: 15, label: 'كل 15 دقيقة' },
  { minutes: 30, label: 'كل 30 دقيقة' },
  { minutes: 60, label: 'كل ساعة' },
];

export const CUSTOM_INTERVAL_LIMITS = { min: 1, max: 720 } as const;

export function intervalLabel(minutes: number): string {
  return REMINDER_INTERVALS.find((i) => i.minutes === minutes)?.label ?? `كل ${minutes} دقيقة`;
}

export type CalcMethodId =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'MoonsightingCommittee'
  | 'NorthAmerica'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Turkey'
  | 'Tehran';

export const CALC_METHODS: { id: CalcMethodId; label: string }[] = [
  { id: 'MuslimWorldLeague', label: 'رابطة العالم الإسلامي' },
  { id: 'Egyptian', label: 'الهيئة المصرية العامة للمساحة' },
  { id: 'Karachi', label: 'جامعة العلوم الإسلامية، كراتشي' },
  { id: 'UmmAlQura', label: 'أم القرى، مكة المكرمة' },
  { id: 'Dubai', label: 'دبي' },
  { id: 'Kuwait', label: 'الكويت' },
  { id: 'Qatar', label: 'قطر' },
  { id: 'Turkey', label: 'رئاسة الشؤون الدينية، تركيا' },
  { id: 'Singapore', label: 'سنغافورة' },
  { id: 'NorthAmerica', label: 'أمريكا الشمالية (ISNA)' },
  { id: 'MoonsightingCommittee', label: 'لجنة رؤية الهلال' },
  { id: 'Tehran', label: 'معهد الجيوفيزياء، طهران' },
];

export function buildCalcParams(id: CalcMethodId) {
  return CalculationMethod[id]();
}

export const PRAYER_LABELS = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
} as const;

/** The five obligatory prayers (sunrise is shown in the list but is never "next prayer"). */
export const OBLIGATORY = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export const FONT_SIZE_LIMITS = { min: 20, max: 44, step: 2, default: 28 } as const;

export const PRIVACY_POLICY = [
  'لا يجمع التطبيق أي بيانات شخصية ولا يرسل شيئاً إلى أي خادم.',
  'يُستخدم موقعك على جهازك فقط لحساب مواقيت الصلاة واتجاه القبلة، ويُحفظ محلياً ويمكنك حذفه بتغيير الموقع في أي وقت.',
  'إعداداتك، وعلاماتك المرجعية، وآخر موضع قراءة، وتقدّم الأذكار تُحفظ على جهازك فقط.',
  'التذكيرات إشعارات محلية تُجدول على جهازك، ويمكنك إيقافها من الإعدادات أو من إعدادات النظام.',
];
