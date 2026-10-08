import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { LucideIcon } from 'lucide-react-native';
import { BookOpen, HandHeart, House } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';

const TABS: Record<string, { label: string; icon: LucideIcon }> = {
  quran: { label: 'القرآن', icon: BookOpen },
  index: { label: 'الرئيسية', icon: House },
  azkar: { label: 'الأذكار', icon: HandHeart },
};

/**
 * Three-item bottom navigation. Route order is [quran, index, azkar]; under RTL layout the first
 * item sits on the right, so: Quran (right) · Home (centre) · Azkar (left).
 */
export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: palette.surface, borderTopColor: palette.border, paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name as never);
        };
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            android_ripple={{ color: palette.border, borderless: true, radius: 40 }}
            style={styles.item}
          >
            <View style={[styles.indicator, { backgroundColor: focused ? palette.primary : 'transparent' }]} />
            <Icon icon={tab.icon} size={24} color={focused ? 'primary' : 'textMuted'} strokeWidth={focused ? 2 : 1.75} />
            <AppText variant="caption" color={focused ? 'primary' : 'textMuted'} style={focused ? styles.focusedLabel : undefined}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 4 },
  item: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 1 },
  indicator: { width: 22, height: 3, borderRadius: 2, marginBottom: 3 },
  focusedLabel: { fontFamily: 'Tajawal_700Bold' },
});
