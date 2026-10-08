import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Settings } from 'lucide-react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrayerSection } from '@/components/home/PrayerSection';
import { QiblaMini } from '@/components/home/QiblaMini';
import { DailyAyahCard } from '@/components/home/DailyAyahCard';
import { useTheme } from '@/theme/ThemeProvider';
import { useNow } from '@/hooks/useNow';
import { usePrayerSchedule } from '@/hooks/usePrayerSchedule';
import { useDailyAyah } from '@/hooks/useDailyAyah';
import { formatGregorian, formatHijri, greetingForHour } from '@/services/dates';
import { formatClock } from '@/utils/time';
import { useSettings } from '@/store/settingsStore';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const clockFormat = useSettings((s) => s.clockFormat);
  const now = useNow(1000);
  const { location, schedule, displayZone } = usePrayerSchedule(now);
  const daily = useDailyAyah(now);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <AppText variant="title">{greetingForHour()}</AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="الإعدادات"
          onPress={() => router.push('/settings')}
          hitSlop={6}
          style={[styles.iconBtn, { backgroundColor: palette.surfaceAlt }]}
        >
          <Icon icon={Settings} size={22} />
        </Pressable>
      </View>

      <View style={styles.dates}>
        <AppText variant="display" style={styles.clock}>
          {formatClock(now, displayZone, clockFormat)}
        </AppText>
        <AppText variant="label" color="primary">
          {formatHijri(now)}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {formatGregorian(now)}
        </AppText>
      </View>

      {schedule && location ? (
        <>
          <Pressable accessibilityRole="button" accessibilityLabel={`الموقع: ${location.label}. تغيير الموقع`} onPress={() => router.push('/location')} style={styles.locChip}>
            <Icon icon={MapPin} size={15} color="textMuted" />
            <AppText variant="caption" color="textMuted">
              {location.label}
            </AppText>
          </Pressable>

          <View style={styles.section}>
            <PrayerSection schedule={schedule} now={now} zone={displayZone} format={clockFormat} />
          </View>

          <View style={[styles.rule, { backgroundColor: palette.border }]} />
          <QiblaMini location={location} />
        </>
      ) : (
        <View style={styles.section}>
          <EmptyState
            icon={MapPin}
            title="حدّد موقعك لعرض المواقيت"
            message="نحتاج الموقع لحساب مواقيت الصلاة واتجاه القبلة. يمكنك السماح بالموقع أو اختيار مدينتك يدوياً."
            actionLabel="تحديد الموقع"
            onAction={() => router.push('/location')}
          />
        </View>
      )}

      {daily ? (
        <>
          <View style={[styles.rule, { backgroundColor: palette.border }]} />
          <DailyAyahCard daily={daily} />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  top: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  dates: { alignItems: 'center', marginTop: 12, gap: 2 },
  clock: { writingDirection: 'ltr', fontVariant: ['tabular-nums'] },
  locChip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 14, minHeight: 36, paddingHorizontal: 10 },
  section: { marginTop: 14 },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: 20 },
});
