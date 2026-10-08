import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { BackArrow, Icon } from './Icon';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  title: string;
  /** Optional trailing element (e.g. an icon button). */
  trailing?: React.ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({ title, trailing, onBack }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="رجوع"
        hitSlop={8}
        onPress={onBack ?? (() => router.back())}
        style={[styles.btn, { backgroundColor: palette.surfaceAlt }]}
      >
        <Icon icon={BackArrow} size={22} />
      </Pressable>
      <AppText variant="heading" style={styles.title} accessibilityRole="header" numberOfLines={1}>
        {title}
      </AppText>
      <View style={styles.trailing}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 12 },
  btn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1 },
  trailing: { minWidth: 44, alignItems: 'center' },
});
