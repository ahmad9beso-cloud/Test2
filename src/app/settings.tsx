import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import {
  Bell,
  BellRing,
  BookOpen,
  Compass,
  Hand,
  Info,
  Layers,
  MapPin,
  Moon,
  Palette,
  Shield,
  Smartphone,
  Sun,
  Type,
  Vibrate,
} from 'lucide-react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ChoiceSheet, Chips, Row, Section, Segmented, Stepper, SwitchRow } from '@/components/ui/SettingsRows';
import { RemindersEditor } from '@/components/settings/RemindersEditor';
import { useTheme } from '@/theme/ThemeProvider';
import { pageThemes } from '@/theme/tokens';
import { useSettings, type AlertablePrayer, type ClockFormat, type Madhab, type QuranSettings, type ThemeMode } from '@/store/settingsStore';
import { useQuran } from '@/store/quranStore';
import { CALC_METHODS, FONT_SIZE_LIMITS, intervalLabel, PRAYER_LABELS } from '@/constants/app';
import { getNotificationPermission, requestNotificationPermission, sendTestNotification } from '@/services/notifications';
import { toArabicIndic } from '@/utils/arabic';

const ALERTABLE: AlertablePrayer[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export default function SettingsScreen() {
  const router = useRouter();
  const { palette } = useTheme();

  const s = useSettings();
  const bookmarks = useQuran((q) => q.bookmarks);
  const position = useQuran((q) => q.position);

  const [methodSheet, setMethodSheet] = useState(false);
  const [madhabSheet, setMadhabSheet] = useState(false);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  const method = CALC_METHODS.find((m) => m.id === s.prayer.method);

  /** Turns something on only if the OS permission is (or becomes) granted. */
  const ensurePermission = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      const state = await getNotificationPermission();
      setBlocked(state === 'denied');
      setNotifMessage('الإشعارات غير مسموحة. فعّلها من إعدادات النظام ليعمل التذكير.');
    } else {
      setNotifMessage(null);
      setBlocked(false);
    }
    return granted;
  };

  const toggleReminders = async (on: boolean) => {
    if (on && !(await ensurePermission())) {
      s.patchReminders({ enabled: false });
      return;
    }
    s.patchReminders({ enabled: on });
  };

  const togglePrayerAlert = async (key: AlertablePrayer, on: boolean) => {
    if (on && !(await ensurePermission())) return;
    s.setPrayerAlert(key, on);
  };

  const test = async () => {
    if (!(await ensurePermission())) return;
    const ok = await sendTestNotification(s.reminders.style);
    setNotifMessage(ok ? 'سيصلك إشعار تجريبي خلال ٥ ثوانٍ. يمكنك إغلاق التطبيق للتأكد.' : 'تعذّر جدولة الإشعار التجريبي.');
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <ScreenHeader title="الإعدادات" />
      <ScrollView contentContainerStyle={styles.body}>
        <Section title="المظهر">
          <View style={styles.pad}>
            <AppText variant="label" style={styles.padLabel}>
              الوضع
            </AppText>
            <Segmented<ThemeMode>
              value={s.theme}
              onChange={s.setTheme}
              options={[
                { value: 'light', label: 'نهاري', icon: Sun },
                { value: 'dark', label: 'ليلي', icon: Moon },
                { value: 'system', label: 'النظام', icon: Smartphone },
              ]
              }
            />
            <AppText variant="label" style={[styles.padLabel, { marginTop: 14 }]}>
              نظام الساعة
            </AppText>
            <Segmented<ClockFormat>
              value={s.clockFormat}
              onChange={s.setClockFormat}
              options={[
                { value: 'h12', label: '١٢ ساعة (ص/م)' },
                { value: 'h24', label: '٢٤ ساعة' },
              ]}
            />
          </View>
        </Section>

        <Section title="القرآن">
          <Row
            title="حجم النص"
            icon={Type}
            trailing={
              <Stepper
                label="حجم نص القرآن"
                value={s.quran.fontSize}
                min={FONT_SIZE_LIMITS.min}
                max={FONT_SIZE_LIMITS.max}
                step={FONT_SIZE_LIMITS.step}
                onChange={(fontSize) => s.patchQuran({ fontSize })}
                format={(v) => toArabicIndic(v)}
              />
            }
          />
          <View style={styles.pad}>
            <AppText variant="label" style={styles.padLabel}>
              مظهر الصفحة
            </AppText>
            <Chips<QuranSettings['pageThemeId']>
              value={s.quran.pageThemeId}
              onChange={(pageThemeId) => s.patchQuran({ pageThemeId })}
              options={pageThemes.map((t) => ({ value: t.id, label: t.label }))}
            />
            <AppText variant="label" style={[styles.padLabel, { marginTop: 14 }]}>
              وضع القراءة
            </AppText>
            <Segmented<QuranSettings['readingMode']>
              value={s.quran.readingMode}
              onChange={(readingMode) => s.patchQuran({ readingMode })}
              options={[
                { value: 'app', label: 'حسب التطبيق' },
                { value: 'light', label: 'نهاري' },
                { value: 'dark', label: 'ليلي' },
              ]}
            />
          </View>
          <Row
            title="آخر موضع قراءة"
            icon={BookOpen}
            value={position ? `صفحة ${toArabicIndic(position.page)}` : 'لا يوجد'}
            onPress={position ? () => router.navigate('/quran') : undefined}
          />
          <Row title="العلامات المرجعية" icon={Layers} value={toArabicIndic(bookmarks.length)} subtitle="تُدار من قائمة خيارات القرآن" />
        </Section>

        <Section title="الأذكار">
          <SwitchRow title="الانتقال التلقائي للذكر التالي" icon={Hand} value={s.azkar.autoNext} onChange={(autoNext) => s.patchAzkar({ autoNext })} />
          <SwitchRow title="الاهتزاز" subtitle="عند كل ضغطة وعند اكتمال العدد" icon={Vibrate} value={s.azkar.haptics} onChange={(haptics) => s.patchAzkar({ haptics })} />
        </Section>

        <Section title="الصلاة">
          <Row title="طريقة الحساب" icon={Compass} value={method?.label} onPress={() => setMethodSheet(true)} />
          <Row title="المذهب (وقت العصر)" icon={Palette} value={s.prayer.madhab === 'hanafi' ? 'حنفي' : 'جمهور (شافعي/مالكي/حنبلي)'} onPress={() => setMadhabSheet(true)} />
          <Row title="الموقع" icon={MapPin} value={s.location?.label ?? 'غير محدد'} onPress={() => router.push('/location')} />
          {ALERTABLE.map((key) => (
            <SwitchRow
              key={key}
              title={`تنبيه ${PRAYER_LABELS[key]}`}
              icon={Bell}
              value={s.prayer.alerts[key]}
              disabled={!s.location}
              onChange={(on) => togglePrayerAlert(key, on)}
            />
          ))}
        </Section>

        <Section title="الإشعارات">
          <SwitchRow
            title="تذكيرات الأذكار"
            subtitle={s.reminders.enabled ? intervalLabel(s.reminders.intervalMinutes) : 'متوقفة'}
            icon={BellRing}
            value={s.reminders.enabled}
            onChange={toggleReminders}
          />
          <View style={styles.pad}>
            <RemindersEditor />
          </View>
          <View style={styles.pad}>
            <Button label="إرسال إشعار تجريبي (٥ ثوانٍ)" variant="soft" icon={Bell} onPress={test} />
            {notifMessage ? (
              <AppText variant="caption" color={blocked ? 'danger' : 'textMuted'} style={{ marginTop: 8 }}>
                {notifMessage}
              </AppText>
            ) : null}
            {blocked ? <Button label="فتح إعدادات النظام" variant="ghost" onPress={() => Linking.openSettings().catch(() => {})} style={{ marginTop: 8 }} /> : null}
            <AppText variant="caption" color="textMuted" style={{ marginTop: 8 }}>
              ظهور الإشعار على شاشة القفل وفوق التطبيقات يعتمد على إعدادات Android للتطبيق.
            </AppText>
          </View>
        </Section>

        <Section title="عن التطبيق">
          <Row title="الإصدار" icon={Info} value={toArabicIndic(version)} />
          <Row title="سياسة الخصوصية" icon={Shield} onPress={() => router.push('/privacy')} />
          <Row title="معلومات التطبيق" icon={Info} subtitle="تطبيق قرآن وأذكار ومواقيت يعمل دون إنترنت، وجميع بياناتك تبقى على جهازك." />
        </Section>
      </ScrollView>

      <ChoiceSheet
        visible={methodSheet}
        title="طريقة حساب المواقيت"
        options={CALC_METHODS.map((m) => ({ value: m.id, label: m.label }))}
        value={s.prayer.method}
        onSelect={(method) => s.patchPrayer({ method })}
        onClose={() => setMethodSheet(false)}
      />
      <ChoiceSheet<Madhab>
        visible={madhabSheet}
        title="المذهب"
        options={[
          { value: 'shafi', label: 'جمهور (شافعي/مالكي/حنبلي)', hint: 'العصر عندما يصبح ظل الشيء مثله' },
          { value: 'hanafi', label: 'حنفي', hint: 'العصر عندما يصبح ظل الشيء مثليه' },
        ]}
        value={s.prayer.madhab}
        onSelect={(madhab) => s.patchPrayer({ madhab })}
        onClose={() => setMadhabSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingBottom: 48 },
  pad: { padding: 16 },
  padLabel: { marginBottom: 8 },
});
