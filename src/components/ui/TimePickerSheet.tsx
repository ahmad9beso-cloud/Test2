import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { AppText } from './AppText';
import { Button } from './Button';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

interface Props {
  visible: boolean;
  title: string;
  /** Minutes from midnight. */
  value: number;
  onClose: () => void;
  onConfirm: (minutes: number) => void;
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const two = (n: number) => String(n).padStart(2, '0');

/** h12: "1", …, "12", "1", … with a ص/م suffix per half-day; h24: "00" … "23". */
function hourLabel(h: number, format: 'h12' | 'h24'): string {
  if (format === 'h24') return two(h);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12} ${h < 12 ? 'ص' : 'م'}`;
}

/** Dependency-free, RTL-safe time picker (hours grid + 5-minute grid), 12h or 24h. */
export function TimePickerSheet({ visible, title, value, onClose, onConfirm }: Props) {
  const { palette } = useTheme();
  const [h, setH] = useState(Math.floor(value / 60));
  const [m, setM] = useState(value % 60);

  useEffect(() => {
    if (visible) {
      setH(Math.floor(value / 60));
      setM(value % 60);
    }
  }, [visible, value]);

  const cell = (label: string, selected: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.cell,
        { borderColor: selected ? palette.primary : palette.border, backgroundColor: selected ? palette.primarySoft : 'transparent' },
      ]}
    >
      <AppText variant="label" color={selected ? 'primary' : 'text'}>
        {label}
      </AppText>
    </Pressable>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <ScrollView contentContainerStyle={styles.body}>
        <PreviewClock minutes={h * 60 + m} />
        <AppText variant="caption" color="textMuted">
          الساعة
        </AppText>
        <View style={styles.grid}>{HOURS_24.map((x) => cell(hourLabel(x, 'h12'), x === h, () => setH(x)))}</View>
        <AppText variant="caption" color="textMuted">
          الدقيقة
        </AppText>
        <View style={styles.grid}>{MINUTES.map((x) => cell(two(x), x === m, () => setM(x)))}</View>
        <Button
          label="تأكيد"
          onPress={() => {
            onConfirm(h * 60 + m);
            onClose();
          }}
        />
      </ScrollView>
    </BottomSheet>
  );
}

/** Big 12-hour preview with the ص/م marker. */
function PreviewClock({ minutes }: { minutes: number }) {
  const h24 = Math.floor(minutes / 60) % 24;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return (
    <AppText variant="display" align="center" style={{ writingDirection: 'ltr' }}>
      {`${h12}:${two(minutes % 60)} ${h24 < 12 ? 'ص' : 'م'}`}
    </AppText>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { minWidth: 64, height: 46, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
});
