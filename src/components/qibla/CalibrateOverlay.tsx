import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Smartphone, X } from 'lucide-react-native';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

/**
 * First-open calibration hint for the qibla compass: an animated "lying 8"
 * gesture that fades in when the screen opens and disappears after the user
 * starts moving the phone or taps "فهمت".
 */
export function CalibrateOverlay({ onDone }: { onDone: () => void }) {
  const { palette } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const stroke = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    // The figure-8 loop: stroke 0 → 1 → 0 repeatedly.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(stroke, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(stroke, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fade, stroke]);

  const close = () => {
    Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
      if (finished) onDone();
    });
  };

  // The "lying 8" (infinity sign) drawn with two circular arcs whose sweep follows `stroke`.
  const dash = stroke.interpolate({ inputRange: [0, 1], outputRange: [8, 300] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { backgroundColor: palette.overlay, opacity: fade }]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityRole="button" accessibilityLabel="إغلاق التعليمات" />
      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <View style={styles.head}>
          <Icon icon={Smartphone} size={22} color="primary" />
          <AppText variant="heading" style={{ flex: 1 }}>
            اعاير البوصلة أولاً
          </AppText>
          <Pressable accessibilityRole="button" accessibilityLabel="إغلاق" hitSlop={10} onPress={close} style={styles.close}>
            <Icon icon={X} size={20} color="textMuted" />
          </Pressable>
        </View>
        <AppText color="textMuted" align="center">
          حرّك الهاتف بالهواء على شكل رقم ٨ بالعرض (∞) عدة مرات، وابتعد عن المعادن والأجهزة الإلكترونية حتى تثبت القراءة.
        </AppText>
        <View style={styles.figureWrap}>
          <Animated.View
            style={[
              styles.figure,
              {
                borderColor: palette.primary,
                opacity: stroke.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
                transform: [{ scale: stroke.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.92, 1.04, 0.92] }) }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.figureSmall,
              {
                borderColor: palette.gold,
                opacity: stroke.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }),
                transform: [{ translateX: stroke.interpolate({ inputRange: [0, 1], outputRange: [-16, 16] }) }],
              },
            ]}
          />
        </View>
        <AppText variant="caption" color="textMuted" align="center">
          أدر الهاتف بهذا الشكل الآن
        </AppText>
        <Button label="فهمت" onPress={close} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: { zIndex: 800, elevation: 800, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '88%',
    maxWidth: 420,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 20,
    gap: 14,
    elevation: 12,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  figureWrap: { height: 110, alignItems: 'center', justifyContent: 'center' },
  // Two linked rings that draw the "∞" gesture.
  figure: { position: 'absolute', width: 108, height: 108, borderRadius: 54, borderWidth: 3, borderLeftColor: 'transparent' },
  figureSmall: { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderRightColor: 'transparent' },
});
