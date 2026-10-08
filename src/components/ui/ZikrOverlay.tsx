import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HandHeart, X } from 'lucide-react-native';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/tokens';
import { haptic } from '@/services/haptics';
import { toArabicIndic } from '@/utils/arabic';

interface ActiveZikr {
  key: number;
  text: string;
  /** Repetitions mentioned in the reminder body, when included. */
  count?: number;
}

/**
 * In-app reminder overlay. When a reminder notification arrives while the app is
 * open, the full zikr is shown big and centred. It hides by itself after a
 * reading time based on the word count, or immediately when tapped.
 */
export function ZikrOverlay() {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const [zikr, setZikr] = useState<ActiveZikr | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    let sub: { remove: () => void } | undefined;
    (async () => {
      try {
        const Notifications = await import('expo-notifications');
        const listener = Notifications.addNotificationReceivedListener((n) => {
          if (!mounted) return;
          const body = n.request.content.body ?? '';
          const data = n.request.content.data as { count?: number } | undefined;
          show(body, data?.count);
        });
        sub = listener;
      } catch {
        // notifications unavailable — the overlay simply never shows
      }
    })();
    return () => {
      mounted = false;
      sub?.remove();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const show = (text: string, count?: number) => {
    if (!text.trim()) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setZikr({ key: Date.now(), text, count });
    Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    // Reading time: ~0.45s per word (min 6s, max 25s), then it fades out by itself.
    const words = text.trim().split(/\s+/).length;
    const seconds = Math.min(25, Math.max(6, Math.round(words * 0.45)));
    hideTimer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setZikr(null);
      });
    }, seconds * 1000);
  };

  const dismiss = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setZikr(null);
    });
  };

  if (!zikr) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      accessibilityLiveRegion="assertive"
      style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: palette.overlay, opacity }]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessibilityRole="button" accessibilityLabel="إخفاء الذكر" />
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border, marginBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.head}>
          <Icon icon={HandHeart} size={20} color="primary" />
          <AppText variant="label" color="primary" style={styles.headTitle}>
            تذكير
          </AppText>
          <Pressable accessibilityRole="button" accessibilityLabel="إغلاق" hitSlop={10} onPress={dismiss} style={styles.close}>
            <Icon icon={X} size={20} color="textMuted" />
          </Pressable>
        </View>
        <Animated.View key={zikr.key} style={styles.textWrap}>
          <AppText style={[styles.zikrText, { color: palette.text }]} align="center" selectable={false}>
            {zikr.text}
          </AppText>
          {zikr.count && zikr.count > 1 ? (
            <AppText variant="label" color="gold" align="center">
              {toArabicIndic(zikr.count)} مرات
            </AppText>
          ) : null}
        </Animated.View>
        <AppText variant="caption" color="textMuted" align="center">
          اضغط في أي مكان للإخفاء
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 900, elevation: 900, alignItems: 'center', justifyContent: 'flex-end' },
  card: {
    width: '92%',
    maxWidth: 460,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 20,
    gap: 14,
    elevation: 12,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headTitle: { flex: 1 },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  textWrap: { gap: 10 },
  zikrText: { fontFamily: fonts.quran, fontSize: 28, lineHeight: 52 },
});
