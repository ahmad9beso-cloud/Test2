import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';
import { toArabicIndic } from '@/utils/arabic';
import type { DailyAyah } from '@/hooks/useDailyAyah';
import { useQuran } from '@/store/quranStore';

/** "Ayah of the day" — text comes from the bundled Quran data only. Tap opens it in the reader. */
export function DailyAyahCard({ daily }: { daily: DailyAyah }) {
  const { palette } = useTheme();
  const router = useRouter();
  const setPosition = useQuran((s) => s.setPosition);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`آية اليوم، سورة ${daily.surahName}، آية ${daily.ayah.ayah}. افتح في المصحف`}
      onPress={() => {
        setPosition({ page: daily.page, surah: daily.ayah.surah, ayah: daily.ayah.ayah });
        router.navigate('/quran');
      }}
    >
      <AppText variant="caption" color="textMuted">
        آية اليوم
      </AppText>
      <View style={[styles.quote, { borderColor: palette.border }]}>
        <AppText style={styles.ayah} align="center" selectable={false}>
          {daily.ayah.text}
        </AppText>
      </View>
      <AppText variant="caption" color="gold" align="center">
        سورة {daily.surahName} · الآية {toArabicIndic(daily.ayah.ayah)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  quote: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, marginVertical: 10, paddingVertical: 16, paddingHorizontal: 6 },
  ayah: { fontFamily: fonts.quran, fontSize: 26, lineHeight: 52 },
});
