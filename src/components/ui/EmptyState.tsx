import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Button } from './Button';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  icon: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Quiet empty / error state used wherever data or a permission is missing. */
export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  const { palette } = useTheme();
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={[styles.badge, { backgroundColor: palette.primarySoft }]}>
        <Icon icon={icon} size={28} color="primary" />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText color="textMuted" align="center" style={styles.msg}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="soft" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40, gap: 8 },
  badge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  msg: { maxWidth: 320 },
  action: { marginTop: 12 },
});
