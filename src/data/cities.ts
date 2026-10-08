export interface City {
  id: string;
  nameAr: string;
  country: string;
  latitude: number;
  longitude: number;
  /** IANA time zone, used to display prayer times of a city you are not physically in. */
  timeZone: string;
}

/** Built-in city list for manual location (works with no GPS / no permission / offline). */
export const CITIES: City[] = [
  { id: 'damascus', nameAr: 'دمشق', country: 'سوريا', latitude: 33.5138, longitude: 36.2765, timeZone: 'Asia/Damascus' },
  { id: 'aleppo', nameAr: 'حلب', country: 'سوريا', latitude: 36.2021, longitude: 37.1343, timeZone: 'Asia/Damascus' },
  { id: 'homs', nameAr: 'حمص', country: 'سوريا', latitude: 34.7324, longitude: 36.7137, timeZone: 'Asia/Damascus' },
  { id: 'latakia', nameAr: 'اللاذقية', country: 'سوريا', latitude: 35.5317, longitude: 35.79, timeZone: 'Asia/Damascus' },
  { id: 'amman', nameAr: 'عمّان', country: 'الأردن', latitude: 31.9454, longitude: 35.9284, timeZone: 'Asia/Amman' },
  { id: 'beirut', nameAr: 'بيروت', country: 'لبنان', latitude: 33.8938, longitude: 35.5018, timeZone: 'Asia/Beirut' },
  { id: 'jerusalem', nameAr: 'القدس', country: 'فلسطين', latitude: 31.7683, longitude: 35.2137, timeZone: 'Asia/Jerusalem' },
  { id: 'baghdad', nameAr: 'بغداد', country: 'العراق', latitude: 33.3152, longitude: 44.3661, timeZone: 'Asia/Baghdad' },
  { id: 'riyadh', nameAr: 'الرياض', country: 'السعودية', latitude: 24.7136, longitude: 46.6753, timeZone: 'Asia/Riyadh' },
  { id: 'jeddah', nameAr: 'جدة', country: 'السعودية', latitude: 21.4858, longitude: 39.1925, timeZone: 'Asia/Riyadh' },
  { id: 'makkah', nameAr: 'مكة المكرمة', country: 'السعودية', latitude: 21.3891, longitude: 39.8579, timeZone: 'Asia/Riyadh' },
  { id: 'madinah', nameAr: 'المدينة المنورة', country: 'السعودية', latitude: 24.5247, longitude: 39.5692, timeZone: 'Asia/Riyadh' },
  { id: 'kuwait', nameAr: 'مدينة الكويت', country: 'الكويت', latitude: 29.3759, longitude: 47.9774, timeZone: 'Asia/Kuwait' },
  { id: 'doha', nameAr: 'الدوحة', country: 'قطر', latitude: 25.2854, longitude: 51.531, timeZone: 'Asia/Qatar' },
  { id: 'dubai', nameAr: 'دبي', country: 'الإمارات', latitude: 25.2048, longitude: 55.2708, timeZone: 'Asia/Dubai' },
  { id: 'abudhabi', nameAr: 'أبوظبي', country: 'الإمارات', latitude: 24.4539, longitude: 54.3773, timeZone: 'Asia/Dubai' },
  { id: 'muscat', nameAr: 'مسقط', country: 'عُمان', latitude: 23.588, longitude: 58.3829, timeZone: 'Asia/Muscat' },
  { id: 'sanaa', nameAr: 'صنعاء', country: 'اليمن', latitude: 15.3694, longitude: 44.191, timeZone: 'Asia/Aden' },
  { id: 'cairo', nameAr: 'القاهرة', country: 'مصر', latitude: 30.0444, longitude: 31.2357, timeZone: 'Africa/Cairo' },
  { id: 'alexandria', nameAr: 'الإسكندرية', country: 'مصر', latitude: 31.2001, longitude: 29.9187, timeZone: 'Africa/Cairo' },
  { id: 'khartoum', nameAr: 'الخرطوم', country: 'السودان', latitude: 15.5007, longitude: 32.5599, timeZone: 'Africa/Khartoum' },
  { id: 'tripoli', nameAr: 'طرابلس', country: 'ليبيا', latitude: 32.8872, longitude: 13.1913, timeZone: 'Africa/Tripoli' },
  { id: 'tunis', nameAr: 'تونس', country: 'تونس', latitude: 36.8065, longitude: 10.1815, timeZone: 'Africa/Tunis' },
  { id: 'algiers', nameAr: 'الجزائر', country: 'الجزائر', latitude: 36.7538, longitude: 3.0588, timeZone: 'Africa/Algiers' },
  { id: 'rabat', nameAr: 'الرباط', country: 'المغرب', latitude: 34.0209, longitude: -6.8416, timeZone: 'Africa/Casablanca' },
  { id: 'casablanca', nameAr: 'الدار البيضاء', country: 'المغرب', latitude: 33.5731, longitude: -7.5898, timeZone: 'Africa/Casablanca' },
  { id: 'istanbul', nameAr: 'إسطنبول', country: 'تركيا', latitude: 41.0082, longitude: 28.9784, timeZone: 'Europe/Istanbul' },
  { id: 'ankara', nameAr: 'أنقرة', country: 'تركيا', latitude: 39.9334, longitude: 32.8597, timeZone: 'Europe/Istanbul' },
  { id: 'tehran', nameAr: 'طهران', country: 'إيران', latitude: 35.6892, longitude: 51.389, timeZone: 'Asia/Tehran' },
  { id: 'karachi', nameAr: 'كراتشي', country: 'باكستان', latitude: 24.8607, longitude: 67.0011, timeZone: 'Asia/Karachi' },
  { id: 'jakarta', nameAr: 'جاكرتا', country: 'إندونيسيا', latitude: -6.2088, longitude: 106.8456, timeZone: 'Asia/Jakarta' },
  { id: 'kualalumpur', nameAr: 'كوالالمبور', country: 'ماليزيا', latitude: 3.139, longitude: 101.6869, timeZone: 'Asia/Kuala_Lumpur' },
  { id: 'london', nameAr: 'لندن', country: 'المملكة المتحدة', latitude: 51.5074, longitude: -0.1278, timeZone: 'Europe/London' },
  { id: 'paris', nameAr: 'باريس', country: 'فرنسا', latitude: 48.8566, longitude: 2.3522, timeZone: 'Europe/Paris' },
  { id: 'berlin', nameAr: 'برلين', country: 'ألمانيا', latitude: 52.52, longitude: 13.405, timeZone: 'Europe/Berlin' },
  { id: 'newyork', nameAr: 'نيويورك', country: 'الولايات المتحدة', latitude: 40.7128, longitude: -74.006, timeZone: 'America/New_York' },
  { id: 'toronto', nameAr: 'تورونتو', country: 'كندا', latitude: 43.6532, longitude: -79.3832, timeZone: 'America/Toronto' },
];

export function findCity(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}
