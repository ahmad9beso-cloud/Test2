import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'soft' | 'ghost';
  icon?: LucideIcon;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled, style, accessibilityHint }: Props) {
  const { palette } = useTheme();
  const bg =
    variant === 'primary' ? palette.primary : variant === 'soft' ? palette.primarySoft : 'transparent';
  const fg = variant === 'primary' ? 'onPrimary' : 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: palette.border }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        variant === 'ghost' && { borderWidth: 1, borderColor: palette.border },
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? <Icon icon={icon} size={20} color={fg === 'onPrimary' ? palette.onPrimary : palette.primary} /> : null}
        <AppText variant="label" color={fg}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
