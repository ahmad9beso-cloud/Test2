import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Full-screen transition between the light and dark themes:
 * the new background colour fades in over the old screen while a sun (→ light)
 * or a crescent moon (→ dark) rises, rotates and dissolves. Purely decorative.
 */
export function ThemeTransitionOverlay() {
  const { isDark, palette } = useTheme();
  const [visible, setVisible] = useState(false);
  const prevDark = useRef<boolean | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (prevDark.current === null) {
      prevDark.current = isDark;
      return;
    }
    if (prevDark.current === isDark) return;
    prevDark.current = isDark;

    setVisible(true);
    progress.setValue(0);
    Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(progress, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  }, [isDark, progress]);

  if (!visible) return null;

  const iconOpacity = progress.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: [0, 1, 1, 0] });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['-70deg', '10deg'] });
  const scale = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.15, 1.8] });
  const bgOpacity = progress.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[StyleSheet.absoluteFill, styles.center, styles.elevated, { backgroundColor: palette.bg, opacity: bgOpacity }]}
    >
      <Animated.View style={{ opacity: iconOpacity, transform: [{ rotate }, { scale }] }}>
        {isDark ? (
          <Moon size={76} color={palette.gold} strokeWidth={1.4} />
        ) : (
          <Sun size={76} color={palette.gold} strokeWidth={1.4} />
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  // Sits above every screen and modal except system UI.
  elevated: { zIndex: 999, elevation: 999 },
});
