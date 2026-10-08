import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LocateFixed } from 'lucide-react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CityPicker } from '@/components/location/CityPicker';
import { useSettings } from '@/store/settingsStore';
import { useLocationActions } from '@/hooks/useLocationActions';
import { useTheme } from '@/theme/ThemeProvider';

export default function LocationScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const location = useSettings((s) => s.location);
  const loc = useLocationActions();

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <ScreenHeader title="الموقع" />
      <View style={styles.top}>
        <AppText color="textMuted">
          {location ? `الموقع الحالي: ${location.label} (${location.mode === 'gps' ? 'تحديد تلقائي' : 'اختيار يدوي'})` : 'لم يتم تحديد موقع بعد.'}
        </AppText>
        <Button
          label={loc.busy ? 'جارٍ تحديد الموقع…' : 'استخدام موقعي الحالي'}
          icon={LocateFixed}
          disabled={loc.busy}
          onPress={async () => {
            if (await loc.useGps()) router.back();
          }}
        />
        {loc.failureMessage ? (
          <AppText variant="caption" color="danger">
            {loc.failureMessage}
          </AppText>
        ) : null}
        {loc.canOpenSettings ? <Button label="فتح إعدادات النظام" variant="soft" onPress={loc.openSystemSettings} /> : null}
        <AppText variant="label" style={{ marginTop: 8 }}>
          أو اختر مدينتك
        </AppText>
      </View>
      <CityPicker
        selectedId={location?.cityId}
        onSelect={(city) => {
          loc.chooseCity(city);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { paddingHorizontal: 16, gap: 10, paddingBottom: 10 },
});
