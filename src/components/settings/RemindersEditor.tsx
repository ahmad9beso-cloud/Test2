import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Bell, BellRing, Clock } from 'lucide-react-native';
import { AppText } from '@/components/ui/AppText';
import { Chips, Row, Segmented, Stepper } from '@/components/ui/SettingsRows';
import { TimePickerSheet } from '@/components/ui/TimePickerSheet';
import { useSettings } from '@/store/settingsStore';
import { CUSTOM_INTERVAL_LIMITS, REMINDER_INTERVALS } from '@/constants/app';
import { minutesToLabel } from '@/utils/time';
import type { ReminderStyle } from '@/domain/types';

const CUSTOM = -1;

interface Props {
  /** Hide start/end time rows (used in onboarding). */
  compact?: boolean;
}

/** Interval + style + active window. Reused by onboarding and Settings. */
export function RemindersEditor({ compact }: Props) {
  const reminders = useSettings((s) => s.reminders);
  const patch = useSettings((s) => s.patchReminders);
  const clockFormat = useSettings((s) => s.clockFormat);
  const preset = REMINDER_INTERVALS.some((i) => i.minutes === reminders.intervalMinutes);
  const [custom, setCustom] = useState(!preset);
  const [picker, setPicker] = useState<'start' | 'end' | null>(null);

  const selected = custom ? CUSTOM : reminders.intervalMinutes;

  return (
    <View style={styles.wrap}>
      <AppText variant="label">التكرار</AppText>
      <Chips<number>
        value={selected}
        options={[...REMINDER_INTERVALS.map((i) => ({ value: i.minutes, label: i.label })), { value: CUSTOM, label: 'مخصص' }]}
        onChange={(v) => {
          if (v === CUSTOM) {
            setCustom(true);
          } else {
            setCustom(false);
            patch({ intervalMinutes: v });
          }
        }}
      />
      {custom ? (
        <View style={styles.customRow}>
          <AppText color="textMuted">كل (بالدقائق)</AppText>
          <Stepper
            label="مدة التكرار بالدقائق"
            value={reminders.intervalMinutes}
            min={CUSTOM_INTERVAL_LIMITS.min}
            max={CUSTOM_INTERVAL_LIMITS.max}
            step={reminders.intervalMinutes >= 60 ? 10 : 1}
            onChange={(v) => patch({ intervalMinutes: v })}
          />
        </View>
      ) : null}

      <AppText variant="label" style={styles.gap}>
        نوع الإشعار
      </AppText>
      <Segmented<ReminderStyle>
        value={reminders.style}
        onChange={(style) => patch({ style })}
        options={[
          { value: 'normal', label: 'عادي', icon: Bell },
          { value: 'heads-up', label: 'بارز', icon: BellRing },
        ]}
      />
      <AppText variant="caption" color="textMuted">
        الإشعار البارز يظهر فوق الشاشة عندما يسمح نظام Android بذلك، وقد يغيّر النظام السلوك حسب إعداداتك.
      </AppText>

      {!compact ? (
        <View style={[styles.gap, styles.times]}>
          <View style={styles.timeCell}>
            <Row title="وقت البداية" icon={Clock} value={minutesToLabel(reminders.startMinutes, clockFormat)} onPress={() => setPicker('start')} />
          </View>
          <View style={styles.timeCell}>
            <Row title="وقت النهاية" icon={Clock} value={minutesToLabel(reminders.endMinutes, clockFormat)} onPress={() => setPicker('end')} />
          </View>
        </View>
      ) : null}

      <TimePickerSheet
        visible={picker !== null}
        title={picker === 'start' ? 'وقت بداية التذكيرات' : 'وقت نهاية التذكيرات'}
        value={picker === 'start' ? reminders.startMinutes : reminders.endMinutes}
        onClose={() => setPicker(null)}
        onConfirm={(m) => patch(picker === 'start' ? { startMinutes: m } : { endMinutes: m })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  gap: { marginTop: 8 },
  customRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  times: { gap: 0 },
  timeCell: { marginHorizontal: -16 },
});
