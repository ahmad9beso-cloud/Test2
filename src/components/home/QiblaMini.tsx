import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { ForwardChevron, Icon } from '@/components/ui/Icon';
import { CompassDial } from '@/components/qibla/CompassDial';
import { useCompass } from '@/hooks/useCompass';
import { qiblaBearing } from '@/services/qibla';
import { useTheme } from '@/theme/ThemeProvider';
import { toArabicIndic } from '@/utils/arabic';
import type { AppLocation } from '@/domain/types';

/** Compact qibla row on Home. Sensors run only while this screen is focused. */
export function QiblaMini({ location }: { location: AppLocation }) {
  const router = useRouter();
  const { palette } = useTheme();
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  const compass = useCompass(focused);
  const bearing = useMemo(() => qiblaBearing(location.latitude, location.longitude), [location.latitude, location.longitude]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`اتجاه القبلة ${Math.round(bearing)} درجة. افتح صفحة القبلة`}
      onPress={() => router.push('/qibla')}
      style={styles.row}
    >
      <CompassDial size={84} heading={compass.status === 'ready' ? compass.heading : 0} qibla={bearing} detailed={false} />
      <View style={styles.text}>
        <AppText variant="caption" color="textMuted">
          اتجاه القبلة
        </AppText>
        <AppText variant="title" style={{ writingDirection: 'ltr', textAlign: 'right' }}>
          {toArabicIndic(Math.round(bearing))}°
        </AppText>
        {compass.status === 'unavailable' ? (
          <AppText variant="caption" color="textMuted">
            لا يوجد حساس بوصلة في جهازك
          </AppText>
        ) : null}
      </View>
      <Icon icon={ForwardChevron} size={20} color={palette.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingVertical: 6, minHeight: 96 },
  text: { flex: 1 },
});
