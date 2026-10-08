import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleCheck, MapPin } from 'lucide-react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CompassDial } from '@/components/qibla/CompassDial';
import { CalibrateOverlay } from '@/components/qibla/CalibrateOverlay';
import { useCompass } from '@/hooks/useCompass';
import { qiblaBearing } from '@/services/qibla';
import { haptic } from '@/services/haptics';
import { useSettings } from '@/store/settingsStore';
import { useTheme } from '@/theme/ThemeProvider';
import { toArabicIndic } from '@/utils/arabic';
import { angleDelta } from '@/utils/time';

const ALIGN_TOLERANCE = 3;

export default function QiblaScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const { width } = useWindowDimensions();
  const location = useSettings((s) => s.location);
  const compass = useCompass(true);
  const [calibrateOpen, setCalibrateOpen] = useState(true);

  const bearing = useMemo(() => (location ? qiblaBearing(location.latitude, location.longitude) : 0), [location]);
  const size = Math.min(width - 56, 360);

  // Signed offset between where the phone points and the qibla.
  const offset = angleDelta(((compass.heading % 360) + 360) % 360, bearing);
  const aligned = compass.status === 'ready' && Math.abs(offset) <= ALIGN_TOLERANCE;

  const wasAligned = useRef(false);
  useEffect(() => {
    if (aligned && !wasAligned.current) haptic.success();
    wasAligned.current = aligned;
  }, [aligned]);

  if (!location) {
    return (
      <View style={[styles.root, { backgroundColor: palette.bg }]}>
        <ScreenHeader title="اتجاه القبلة" />
        <EmptyState
          icon={MapPin}
          title="نحتاج موقعك لحساب القبلة"
          message="اسمح بالموقع أو اختر مدينتك يدوياً."
          actionLabel="تحديد الموقع"
          onAction={() => router.push('/location')}
        />
      </View>
    );
  }

  // expo-location reports `accuracy` as an error estimate in degrees (lower = better),
  // never as a calibration flag — the old mapping (<= 1 → “needs calibration”) fired forever.
  const needsCalibration = false;

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <ScreenHeader title="اتجاه القبلة" />
      <ScrollView contentContainerStyle={styles.body}>
        <AppText color="textMuted" align="center">
          {location.label}
        </AppText>

        <View style={styles.dial}>
          <CompassDial size={size} heading={compass.status === 'ready' ? compass.heading : 0} qibla={bearing} />
        </View>

        <AppText variant="display" align="center" style={{ writingDirection: 'ltr' }}>
          {toArabicIndic(Math.round(bearing))}°
        </AppText>
        <AppText color="textMuted" align="center">
          درجة القبلة من الشمال
        </AppText>

        {compass.status === 'ready' ? (
          <View style={[styles.status, { backgroundColor: aligned ? palette.primarySoft : palette.surfaceAlt }]} accessibilityLiveRegion="polite">
            {aligned ? <Icon icon={CircleCheck} size={20} color="primary" /> : null}
            <AppText variant="label" color={aligned ? 'primary' : 'text'}>
              {aligned
                ? 'أنت باتجاه القبلة'
                : `أدر الهاتف ${toArabicIndic(Math.round(Math.abs(offset)))}° نحو ${offset > 0 ? 'اليمين' : 'اليسار'}`}
            </AppText>
          </View>
        ) : null}

        {compass.status === 'loading' ? (
          <AppText color="textMuted" align="center">
            جارٍ قراءة حساس البوصلة…
          </AppText>
        ) : null}

        {compass.status === 'unavailable' ? (
          <View style={[styles.note, { backgroundColor: palette.surfaceAlt }]}>
            <AppText variant="label">لا يوجد حساس بوصلة في هذا الجهاز</AppText>
            <AppText variant="caption" color="textMuted">
              القبلة على بعد {toArabicIndic(Math.round(bearing))}° من الشمال. استخدم بوصلة خارجية أو حدّد الشمال ثم أدر وجهك بهذه الزاوية.
            </AppText>
          </View>
        ) : null}

        {needsCalibration ? (
          <View style={[styles.note, { backgroundColor: palette.surfaceAlt }]}>
            <AppText variant="label">البوصلة تحتاج إلى معايرة</AppText>
            <AppText variant="caption" color="textMuted">
              حرّك الهاتف في الهواء على شكل رقم ٨ عدة مرات، وابتعد عن المعادن والمغناطيس والأجهزة الإلكترونية.
            </AppText>
          </View>
        ) : null}

        <AppText variant="caption" color="textMuted" align="center">
          {compass.status === 'ready' && compass.trueNorth ? 'الاتجاه محسوب بالنسبة للشمال الحقيقي.' : 'أمسك الهاتف أفقياً لأدق قراءة.'}
        </AppText>

        <Button label="تغيير الموقع" variant="ghost" onPress={() => router.push('/location')} />
      </ScrollView>

      {/* First-open calibration lesson: an animated "lying 8" gesture. */}
      {calibrateOpen ? <CalibrateOverlay onDone={() => setCalibrateOpen(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  dial: { alignItems: 'center', marginVertical: 22 },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 999, paddingHorizontal: 18, alignSelf: 'center' },
  note: { borderRadius: 16, padding: 14, gap: 4 },
});
