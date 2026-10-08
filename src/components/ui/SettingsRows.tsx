import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Check, Minus, Plus } from 'lucide-react-native';
import { AppText } from './AppText';
import { ForwardChevron, Icon } from './Icon';
import { BottomSheet } from './BottomSheet';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { palette } = useTheme();
  return (
    <View style={styles.section}>
      <AppText variant="caption" color="textMuted" style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </AppText>
      <View style={[styles.group, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        {React.Children.toArray(children).map((child, i, arr) => (
          <View key={i}>
            {child}
            {i < arr.length - 1 ? <View style={[styles.sep, { backgroundColor: palette.border }]} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

interface RowProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  value?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  disabled?: boolean;
}

export function Row({ title, subtitle, icon, value, onPress, trailing, disabled }: RowProps) {
  const content = (
    <View style={[styles.row, disabled && { opacity: 0.5 }]}>
      {icon ? <Icon icon={icon} size={22} color="primary" /> : null}
      <View style={styles.rowText}>
        <AppText variant="label">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.value}>
          {value}
        </AppText>
      ) : null}
      {trailing}
      {onPress && !trailing ? <Icon icon={ForwardChevron} size={18} color="textMuted" /> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${title}، ${value}` : title}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
    >
      {content}
    </Pressable>
  );
}

interface SwitchRowProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

export function SwitchRow({ title, subtitle, icon, value, onChange, disabled }: SwitchRowProps) {
  const { palette } = useTheme();
  return (
    <Row
      title={title}
      subtitle={subtitle}
      icon={icon}
      disabled={disabled}
      trailing={
        <Switch
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          accessibilityLabel={title}
          trackColor={{ false: palette.border, true: palette.primary }}
          thumbColor={palette.isDark ? '#EFE9DA' : '#FFFFFF'}
        />
      }
    />
  );
}

interface SegmentedProps<T extends string> {
  options: { value: T; label: string; icon?: LucideIcon }[];
  value: T;
  onChange: (v: T) => void;
}

/** Segmented choice. The selected segment is marked with a check icon, not just colour. */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const { palette } = useTheme();
  return (
    <View style={[styles.segWrap, { backgroundColor: palette.surfaceAlt }]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
            style={[styles.seg, selected && { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }]}
          >
            {o.icon ? <Icon icon={o.icon} size={18} color={selected ? 'primary' : 'textMuted'} /> : null}
            <AppText variant="label" color={selected ? 'primary' : 'textMuted'}>
              {o.label}
            </AppText>
            {selected ? <Icon icon={Check} size={15} color="primary" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

interface ChipsProps<T extends string | number> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}

export function Chips<T extends string | number>({ options, value, onChange }: ChipsProps<T>) {
  const { palette } = useTheme();
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[
              styles.chip,
              { borderColor: selected ? palette.primary : palette.border, backgroundColor: selected ? palette.primarySoft : 'transparent' },
            ]}
          >
            {selected ? <Icon icon={Check} size={14} color="primary" /> : null}
            <AppText variant="caption" color={selected ? 'primary' : 'text'}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

interface StepperProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  label: string;
  format?: (v: number) => string;
}

export function Stepper({ value, min, max, step, onChange, label, format }: StepperProps) {
  const { palette } = useTheme();
  const btn = (icon: LucideIcon, delta: number, a11y: string, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      disabled={disabled}
      onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))}
      style={[styles.stepBtn, { backgroundColor: palette.primarySoft, opacity: disabled ? 0.4 : 1 }]}
    >
      <Icon icon={icon} size={20} color="primary" />
    </Pressable>
  );
  return (
    <View style={styles.stepper} accessibilityLabel={label}>
      {btn(Minus, -step, `تصغير ${label}`, value <= min)}
      <AppText variant="heading" style={styles.stepValue} align="center">
        {format ? format(value) : String(value)}
      </AppText>
      {btn(Plus, step, `تكبير ${label}`, value >= max)}
    </View>
  );
}

interface ChoiceSheetProps<T extends string | number> {
  visible: boolean;
  title: string;
  options: { value: T; label: string; hint?: string }[];
  value: T | null;
  onSelect: (v: T) => void;
  onClose: () => void;
}

/** Single-choice list in a bottom sheet (calculation method, madhab, …). */
export function ChoiceSheet<T extends string | number>({ visible, title, options, value, onSelect, onClose }: ChoiceSheetProps<T>) {
  const { palette } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <ScrollView contentContainerStyle={styles.choiceList}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={String(o.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => {
                onSelect(o.value);
                onClose();
              }}
              style={[styles.choice, { borderColor: selected ? palette.primary : palette.border }]}
            >
              <View style={{ flex: 1 }}>
                <AppText variant="label">{o.label}</AppText>
                {o.hint ? (
                  <AppText variant="caption" color="textMuted">
                    {o.hint}
                  </AppText>
                ) : null}
              </View>
              {selected ? <Icon icon={Check} size={20} color="primary" /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 22, paddingHorizontal: 16 },
  sectionTitle: { marginBottom: 8, paddingHorizontal: 4 },
  group: { borderRadius: radius.md, borderWidth: 1, overflow: 'hidden' },
  sep: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  row: { minHeight: 60, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowText: { flex: 1 },
  value: { maxWidth: 150 },
  segWrap: { flexDirection: 'row', borderRadius: radius.md, padding: 4, gap: 4 },
  seg: { flex: 1, minHeight: 46, borderRadius: radius.sm + 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: 'transparent' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 56 },
  choiceList: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  choice: { minHeight: 56, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
