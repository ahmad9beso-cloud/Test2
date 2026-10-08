import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Fixed fraction of the screen height. Omit to size to content (max 85%). */
  heightRatio?: number;
}

const SCREEN_H = Dimensions.get('window').height;

/** Calm bottom sheet: fade backdrop + slide, drag the handle down to dismiss. */
export function BottomSheet({ visible, onClose, title, children, heightRatio }: Props) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: SCREEN_H, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setMounted(false));
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = useCallback(() => onClose(), [onClose]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) translateY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 110 || g.vy > 0.9) close();
          else Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
        },
      }),
    [close, translateY],
  );

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={close}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: palette.overlay, opacity: backdrop }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="إغلاق" accessibilityRole="button" />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.surface,
              paddingBottom: insets.bottom + 12,
              transform: [{ translateY }],
              ...(heightRatio ? { height: SCREEN_H * heightRatio } : { maxHeight: SCREEN_H * 0.85 }),
            },
          ]}
        >
          <View {...pan.panHandlers} style={styles.handleArea}>
            <View style={[styles.handle, { backgroundColor: palette.border }]} />
            {title ? (
              <AppText variant="heading" align="center" style={styles.title} accessibilityRole="header">
                {title}
              </AppText>
            ) : null}
          </View>
          <View style={styles.body}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
  },
  handleArea: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  handle: { width: 44, height: 5, borderRadius: 3 },
  title: { marginTop: 10, marginBottom: 4 },
  body: { flexShrink: 1, flexGrow: 1 },
});
