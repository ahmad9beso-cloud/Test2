# سكينة — تطبيق قرآن وأذكار ومواقيت (Android)

تطبيق جوال حقيقي مبني بـ **React Native + Expo (SDK 57) + TypeScript**، يعمل دون إنترنت، عربي RTL بالكامل، ولا يحتاج Android Studio للتطوير أو البناء.

> **المحتوى الديني:** لم يُخترع أي نص ديني في هذا المشروع. القرآن والأذكار موجودان كبنية بيانات جاهزة لاستقبال المحتوى الموثوق. الموجود الآن **عيّنات تحقق صغيرة** فقط (انظر «بيانات التحقق الحالية»).

---

## 1. التقنية ولماذا

| الاختيار | السبب |
|---|---|
| Expo + React Native | تطبيق Android أصلي حقيقي، وبناء سحابي أو عبر GitHub Actions بلا Android Studio |
| Expo Router | تنقّل حقيقي قائم على الملفات، وروابط الإشعارات تفتح الشاشة المطلوبة |
| Zustand + AsyncStorage | حالة بسيطة وسريعة مع حفظ محلي تلقائي (Offline First) |
| `adhan` | حساب المواقيت والقبلة محلياً بمعادلات فلكية — بلا API وبلا إنترنت |
| expo-location / expo-sensors | الموقع والبوصلة الحقيقيان |
| expo-notifications | إشعارات محلية مجدولة على الجهاز |
| lucide-react-native | مكتبة أيقونات واحدة بأسلوب بصري واحد |
| Tajawal (الواجهة) + Amiri Quran (نص القرآن) | خطان مضمّنان؛ خط المصحف قابل للاستبدال بخط مصحف مخصص |

## 2. هيكل المشروع

```
src/
  app/                    ← الشاشات (Expo Router)
    _layout.tsx             الجذر: الخطوط، الثيم، الإشعارات
    onboarding.tsx          أول تشغيل (مظهر ← تذكيرات ← موقع)
    (tabs)/                 القرآن · الرئيسية · الأذكار
    azkar/[categoryId].tsx  شاشة الذكر والعداد
    qibla.tsx · location.tsx · settings.tsx · privacy.tsx
  components/             مكوّنات قابلة لإعادة الاستخدام (ui, quran, home, qibla, azkar, settings)
  theme/                  design tokens + ThemeProvider (نهاري/ليلي/نظام)
  domain/types.ts         نماذج البيانات: Surah, Ayah, Bookmark, ReadingPosition, Dhikr …
  data/                   طبقة البيانات (لا تستورد الشاشات JSON مباشرة)
    quran/                  manifest + surahs + pages/NNN.json + pageLoaders.ts
    azkar/                  categories.json + azkar.json
    repositories/           quranRepository · azkarRepository
    cities.ts               مدن للاختيار اليدوي
  store/                  settings · quran · azkar (محفوظة محلياً)
  services/               prayer · qibla · location · notifications · dates · haptics
  hooks/                  useCompass · usePrayerSchedule · useNotificationSync …
scripts/                  import-quran.mjs · validate-azkar.mjs
.github/workflows/        ci.yml · android-apk.yml · eas-build.yml
```

الفصل بين الطبقات: **الشاشات** تستدعي **hooks/stores** التي تستدعي **services/repositories**. لا توجد بيانات دينية داخل أي واجهة.

## 3. التشغيل محلياً

```bash
npm install
npm run typecheck
npx expo start            # يعرض QR
```

المشروع يستخدم وحدات أصلية (إشعارات، موقع، حساسات)، لذلك للتجربة على جهاز حقيقي استخدم أحد الخيارين:

- **Development build** (موصى به): `eas build --profile development --platform android` ثم ثبّت الـ APK على هاتفك وشغّل `npx expo start --dev-client`.
- **أو** ابنِ APK عبر GitHub Actions (القسم 4) وثبّته مباشرة.

> تطبيق Expo Go لا يدعم كل الإشعارات في Android؛ لذلك لا نعتمد عليه لاختبار التذكيرات.

## 4. بناء APK / AAB بدون Android Studio

### أ) GitHub Actions بدون أي حساب (APK)
1. ارفع المشروع إلى GitHub.
2. من تبويب **Actions ← Android APK ← Run workflow** (أو ادفع وسماً مثل `v1.0.0`).
3. ينزّل الـ APK من **Artifacts** بعد انتهاء البناء (~10–20 دقيقة).

الـ APK موقّع بمفتاح debug افتراضياً (مناسب للتجربة). للتوقيع بمفتاحك أضف أسرار المستودع:
`ANDROID_KEYSTORE_BASE64` · `ANDROID_KEYSTORE_PASSWORD` · `ANDROID_KEY_ALIAS` · `ANDROID_KEY_PASSWORD`.

### ب) EAS Build (APK للتجربة أو AAB لمتجر Google Play)
```bash
npm i -g eas-cli
eas login
eas init                                  # يضيف projectId إلى app.json
eas build --platform android --profile preview      # APK
eas build --platform android --profile production   # AAB
```
أو شغّل workflow **EAS Build** من GitHub بعد إضافة السر `EXPO_TOKEN`.

> غيّر `android.package` و`ios.bundleIdentifier` في `app.json` إلى معرّفك الخاص قبل النشر.

## 5. إضافة بيانات القرآن

الشكل المطلوب (من مصدر موثوق، مثل بيانات مجمع الملك فهد أو Tanzil بالنص العثماني):

`ayahs.json`
```json
[{ "surah": 1, "ayah": 1, "page": 1, "juz": 1, "text": "…" }]
```
`surahs.json`
```json
[{ "id": 1, "nameAr": "الفاتحة", "ayahCount": 7, "bismillahPre": false }]
```
ثم:
```bash
npm run data:quran -- ayahs.json surahs.json
```
السكربت يتحقق من التكرار والحقول، ويولّد صفحات `pages/001…604.json` و`manifest.json` و`pageLoaders.ts`، ويحدد اكتمال المصحف تلقائياً. **لا تغيير في أي كود آخر**: القارئ والبحث والفهرس والآية اليومية تعمل مباشرة على البيانات الجديدة.

خط المصحف: الافتراضي Amiri Quran. لخط مصحف مخصص (مثل KFGQPC Uthmani Hafs) ضع ملف الخط في `assets/fonts` وحمّله في `src/app/_layout.tsx` ثم غيّر القيمة `fonts.quran` في `src/theme/tokens.ts`.

## 6. إضافة الأذكار

عدّل `src/data/azkar/azkar.json` (وأظهر التصنيفات الإضافية بتغيير `visible` في `categories.json`):

```json
{
  "id": "unique-id",
  "categoryIds": ["morning"],
  "order": 1,
  "text": "نص الذكر",
  "count": 3,
  "virtue": "اختياري",
  "evidence": { "text": "نص الدليل", "narrator": "الراوي", "source": "المصدر ورقم الحديث", "grade": "الدرجة" }
}
```
تحقق بـ `npm run data:azkar`. حقول الدليل اختيارية؛ يعرض التطبيق ما هو موجود فقط ولا يولّد شيئاً. احذف العناصر التي تبدأ بـ `sample-` عند إضافة المحتوى الكامل.

## 7. الصلاحيات والإشعارات والموقع

- **الموقع:** يُطلب فقط عند الضغط على «السماح بالموقع». عند الرفض أو إيقاف GPS أو انتهاء المهلة يعرض التطبيق رسالة واضحة ويفتح اختيار المدينة اليدوي؛ التطبيق يعمل في كل الحالات. الموقع المحفوظ يكفي للعمل دون إنترنت.
- **الإشعارات:** تُطلب عند تفعيل التذكيرات. عند الرفض تُعرض رسالة وزر لفتح إعدادات النظام. التذكيرات محلية (لا خادم): يومية متكررة عند ≤ 96 تذكيراً في اليوم، ونافذة متجددة عند التكرار الكثيف جداً (تُعاد جدولتها عند فتح التطبيق). لا يحاول التطبيق تجاوز قيود Android (Doze، شاشة القفل، عدم الإزعاج).
- يوجد زر **«إرسال إشعار تجريبي»** في الإعدادات للتحقق من المسار كاملاً.
- الصلاحيات المعلنة في `app.json`: الموقع، الإشعارات، الاهتزاز.

## 8. بيانات التحقق الحالية (عيّنات فقط)

- **القرآن:** سورة الفاتحة (كاملة)، آية الرعد 43 وآية إبراهيم 1 (الصفحة 255، مطابقة لصورة المرجع)، وسورة الإخلاص — أي 3 صفحات من 604، والصفحتان 255 و604 **جزئيتان**. تظهر في القارئ عبارة «نسخة تحقق مصغّرة».
- **الأذكار:** 5 عناصر بنصوص وأسانيد من صحيح مسلم (597، 2692) وصحيح البخاري (7394) وسنن أبي داود (5088)، تحققت منها من مصادر الحديث المعروفة. **راجعها بنفسك قبل النشر.**

## 9. ما يعمل فعلياً

مواقيت الصلاة (12 طريقة حساب + المذهب) · القبلة والبوصلة الحية · التاريخ الهجري · ثيم نهاري/ليلي/نظام · حفظ آخر صفحة تلقائياً · علامات للصفحات والآيات · حجم النص ومظهر الصفحة · الانتقال لصفحة والبحث (دون تشكيل) وقائمة السور · عدّاد الأذكار مع اهتزاز وانتقال تلقائي · تذكيرات وتنبيهات صلاة · Onboarding · إعدادات كاملة.

## 10. حدود معروفة

- لم يُختبر على جهاز Android حقيقي ضمن هذا التسليم: اجتاز فحص الأنواع وبناء حزمة JS لـ Android فقط. اختبر البوصلة والإشعارات على هاتفك.
- التاريخ الهجري يستخدم تقويم Intl (أم القرى) ويرجع لحساب جدولي عند عدم توفره؛ قد يختلف يوماً عن الرؤية المحلية.
- تقسيم الصفحة نصٌّ متدفق مضبوط (justify) وليس رسم مصحف سطراً بسطر؛ للحصول على مطابقة حرفية لصفحات المصحف يلزم خط/بيانات صفحات مصحف مخصصة.
