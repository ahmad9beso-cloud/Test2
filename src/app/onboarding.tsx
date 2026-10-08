import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, MapPin, Moon, Smartphone, Sun } from 'lucide-react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Segmented } from '@/components/ui/SettingsRows';
import { RemindersEditor } from '@/components/settings/RemindersEditor';
import { CityPicker } from '@/components/location/CityPicker';
import { useTheme } from '@/theme/ThemeProvider';
import { useSettings, type ThemeMode } from '@/store/settingsStore';
import { requestNotificationPermission } from '@/services/notifications';
import { useLocationActions } from '@/hooks/useLocationActions';
import { APP_NAME } from '@/constants/app';

type Step = 0 | 1 | 2;

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const [step, setStep] = useState<Step>(0);
  const [pickCity, setPickCity] = useState(false);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  const theme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const reminders = useSettings((s) => s.reminders);
  const patchReminders = useSettings((s) => s.patchReminders);
  const location = useSettings((s) => s.location);
  const completeOnboarding = useSettings((s) => s.completeOnboarding);
  const loc = useLocationActions();

  const finish = () => {
    completeOnboarding();
    router.replace('/');
  };

  const enableReminders = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      patchReminders({ enabled: true });
      setNotifMessage(null);
      setStep(2);
    } else {
      patchReminders({ enabled: false });
      setNotifMessage('لم يتم السماح بالإشعارات، يمكنك تفعيلها لاحقاً من الإعدادات.');
    }
  };

  const dots = (
    <View style={styles.dots} accessibilityLabel={`الخطوة ${step + 1} من 3`}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.dot, { backgroundColor: i === step ? palette.primary : palette.border, width: i === step ? 26 : 8 }]} />
      ))}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bg, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.top}>
        <AppText variant="caption" color="gold" style={styles.brand}>
          {APP_NAME}
        </AppText>
        {dots}
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {step === 0 ? (
          <View style={styles.block}>
            <AppText variant="title">اختر مظهر التطبيق</AppText>
            <AppText color="textMuted">يمكنك تغييره في أي وقت من الإعدادات.</AppText>
            <View style={{ height: 12 }} />
            <Segmented<ThemeMode>
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'light', label: 'نهاري', icon: Sun },
                { value: 'dark', label: 'ليلي', icon: Moon },
                { value: 'system', label: 'النظام', icon: Smartphone },
              ]}
            />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.block}>
            <View style={[styles.badge, { backgroundColor: palette.primarySoft }]}>
              <Icon icon={Bell} size={28} color="primary" />
            </View>
            <AppText variant="title">تذكيرات الأذكار</AppText>
            <AppText color="textMuted">هل تريد تفعيلها؟ يمكنك ضبط التفاصيل لاحقاً من الإعدادات.</AppText>
            <View style={{ height: 8 }} />
            <RemindersEditor compact />
            {notifMessage ? (
              <AppText variant="caption" color="danger">
                {notifMessage}
              </AppText>
            ) : null}
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.block}>
            <View style={[styles.badge, { backgroundColor: palette.primarySoft }]}>
              <Icon icon={MapPin} size={28} color="primary" />
            </View>
            <AppText variant="title">الموقع</AppText>
            <AppText color="textMuted">نحتاج موقعك لحساب مواقيت الصلاة وتحديد القبلة. يبقى الموقع على جهازك فقط.</AppText>

            {location ? (
              <View style={[styles.chosen, { backgroundColor: palette.primarySoft }]}>
                <Icon icon={MapPin} size={18} color="primary" />
                <AppText variant="label" color="primary">
                  {location.label}
                </AppText>
              </View>
            ) : null}

            {loc.failureMessage ? (
              <AppText variant="caption" color="danger">
                {loc.failureMessage}
              </AppText>
            ) : null}

            {pickCity ? (
              <View style={{ height: 380, marginHorizontal: -16 }}>
                <CityPicker selectedId={location?.cityId} onSelect={loc.chooseCity} />
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.actions}>
        {step === 0 ? <Button label="التالي" onPress={() => setStep(1)} /> : null}

        {step === 1 ? (
          <>
            <Button label="نعم، فعّل التذكيرات" onPress={enableReminders} icon={Bell} />
            <Button
              label="لاحقاً"
              variant="ghost"
              onPress={() => {
                patchReminders({ enabled: false });
                setStep(2);
              }}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            {location ? (
              <Button label="ابدأ" onPress={finish} />
            ) : (
              <>
                <Button
                  label={loc.busy ? 'جارٍ تحديد الموقع…' : 'السماح بالموقع'}
                  icon={MapPin}
                  disabled={loc.busy}
                  onPress={async () => {
                    const ok = await loc.useGps();
                    if (!ok) setPickCity(true);
                  }}
                />
                <Button label="اختيار المدينة يدوياً" variant="soft" onPress={() => setPickCity(true)} />
                <Button label="تخطّي الآن" variant="ghost" onPress={finish} />
              </>
            )}
            {location ? <Button label="تغيير الموقع" variant="ghost" onPress={() => setPickCity(true)} /> : null}
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  top: { alignItems: 'center', gap: 14 },
  brand: { letterSpacing: 1 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: 24 },
  block: { gap: 10 },
  badge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  chosen: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  actions: { gap: 10 },
});
