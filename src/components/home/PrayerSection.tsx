import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { PRAYER_LABELS } from '@/constants/app';
import { formatClock, formatCountdown } from '@/utils/time';
import { toArabicIndic } from '@/utils/arabic';
import type { DaySchedule } from '@/services/prayer';

interface Props {
  schedule: DaySchedule;
  now: Date;
  zone?: string;
  /** 12-hour with ص/م (default) or 24-hour clock. */
  format?: 'h12' | 'h24';
}

/** Next prayer + live countdown, then the six times as a quiet list. */
export function PrayerSection({ schedule, now, zone, format = 'h24' }: Props) {
  const { palette } = useTheme();
  const remaining = (schedule.next.time.getTime() - now.getTime()) / 1000;

  return (
    <View>
      <View style={styles.next} accessible accessibilityLabel={`الصلاة القادمة ${PRAYER_LABELS[schedule.next.key]} ${formatClock(schedule.next.time, zone, format)}، باقي ${formatCountdown(remaining)}`}>
        <AppText variant="caption" color="textMuted">
          الصلاة القادمة
        </AppText>
        <AppText variant="title" color="primary">
          {PRAYER_LABELS[schedule.next.key]}
        </AppText>
        <AppText variant="display" style={styles.nextTime}>
          {formatClock(schedule.next.time, zone, format)}
        </AppText>
        <View style={styles.countdownRow}>
          <AppText variant="caption" color="textMuted">
            باقي
          </AppText>
          <AppText variant="heading" color="gold" style={styles.countdown}>
            {formatCountdown(remaining)}
          </AppText>
        </View>
      </View>

      <View style={[styles.rule, { backgroundColor: palette.border }]} />

      <AppText variant="caption" color="textMuted" style={styles.listTitle}>
        مواقيت الصلاة
      </AppText>
      {schedule.today.map((p) => {
        const isNext = p.key === schedule.next.key && p.time.getTime() === schedule.next.time.getTime();
        const isCurrent = p.key === schedule.current;
        return (
          <View key={p.key} style={styles.row} accessible accessibilityLabel={`${PRAYER_LABELS[p.key]} ${formatClock(p.time, zone, format)}${isNext ? '، القادمة' : ''}${isCurrent ? '، الحالية' : ''}`}>
            <View style={[styles.marker, { backgroundColor: isNext ? palette.primary : isCurrent ? palette.gold : 'transparent' }]} />
            <AppText variant="body" color={isNext ? 'primary' : 'text'} style={[styles.name, isNext && styles.bold]}>
              {PRAYER_LABELS[p.key]}
            </AppText>
            {isNext ? (
              <AppText variant="caption" color="primary">
                القادمة
              </AppText>
            ) : isCurrent ? (
              <AppText variant="caption" color="gold">
                الحالية
              </AppText>
            ) : null}
            <AppText variant="body" color={isNext ? 'primary' : 'text'} style={[styles.time, isNext && styles.bold]}>
              {formatClock(p.time, zone, format)}
            </AppText>
          </View>
        );
      })}
      <AppText variant="caption" color="textMuted" style={styles.note}>
        {zone ? `التوقيت المحلي للمدينة المختارة` : `بتوقيت جهازك`}
        {` · ${toArabicIndic(schedule.today.length)} أوقات`}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  next: { alignItems: 'center', paddingVertical: 8 },
  nextTime: { writingDirection: 'ltr', marginTop: 2 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  countdown: { writingDirection: 'ltr', fontVariant: ['tabular-nums'] },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: 18 },
  listTitle: { marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 10 },
  marker: { width: 6, height: 6, borderRadius: 3 },
  name: { flex: 1 },
  time: { writingDirection: 'ltr', fontVariant: ['tabular-nums'] },
  bold: { fontFamily: 'Tajawal_700Bold' },
  note: { marginTop: 8, textAlign: 'center' },
});
