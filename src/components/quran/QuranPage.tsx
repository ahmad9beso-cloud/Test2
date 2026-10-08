import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppText } from '@/components/ui/AppText';
import { fonts, type PageTheme } from '@/theme/tokens';
import { quranRepository } from '@/data/repositories/quranRepository';
import { juzLabel, toArabicIndic } from '@/utils/arabic';
import type { Ayah, Bookmark, QuranPageData } from '@/domain/types';

const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

interface Props {
  data: QuranPageData;
  width: number;
  height: number;
  fontSize: number;
  pageTheme: PageTheme;
  dark: boolean;
  bookmarks: Bookmark[];
  /** Ayah to highlight (last reading position / search result). */
  highlight?: { surah: number; ayah: number } | null;
  sample: boolean;
  onAyahPress: (ayah: Ayah) => void;
  onPagePress: () => void;
}

interface Block {
  key: string;
  /** Surah that starts at this point of the page, if any. */
  surahStart?: number;
  ayahs: Ayah[];
}

/** Splits the page into runs of ayahs, starting a new run where a surah begins. */
function toBlocks(data: QuranPageData): Block[] {
  const blocks: Block[] = [];
  for (const a of data.ayahs) {
    const last = blocks[blocks.length - 1];
    if (a.ayah === 1) {
      blocks.push({ key: `s${a.surah}`, surahStart: a.surah, ayahs: [a] });
    } else if (last) {
      last.ayahs.push(a);
    } else {
      blocks.push({ key: `c${a.surah}-${a.ayah}`, ayahs: [a] });
    }
  }
  return blocks;
}

/** Ornamental surah title frame, drawn with SVG so it scales with any width. */
function SurahBanner({ name, color, bg, width }: { name: string; color: string; bg: string; width: number }) {
  const h = 46;
  return (
    <View style={{ width, height: h, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityRole="header" accessibilityLabel={`سورة ${name}`}>
      <Svg width={width} height={h} style={StyleSheet.absoluteFill}>
        <Rect x={1} y={1} width={width - 2} height={h - 2} rx={6} fill={bg} stroke={color} strokeWidth={1.4} />
        <Rect x={5} y={5} width={width - 10} height={h - 10} rx={4} fill="none" stroke={color} strokeWidth={0.7} opacity={0.7} />
        {/* small end ornaments */}
        <Path d={`M16 ${h / 2} l8 -7 l8 7 l-8 7 z`} fill="none" stroke={color} strokeWidth={1} />
        <Path d={`M${width - 16} ${h / 2} l-8 -7 l-8 7 l8 7 z`} fill="none" stroke={color} strokeWidth={1} />
      </Svg>
      <Text style={{ fontFamily: fonts.quran, fontSize: 24, color }} allowFontScaling={false}>
        سُورَةُ {name}
      </Text>
    </View>
  );
}

function QuranPageImpl({ data, width, height, fontSize, pageTheme, dark, bookmarks, highlight, sample, onAyahPress, onPagePress }: Props) {
  const colors = dark ? pageTheme.dark : pageTheme.light;
  const blocks = useMemo(() => toBlocks(data), [data]);
  const bookmarkedAyahs = useMemo(() => new Set(bookmarks.filter((b) => b.surah !== undefined).map((b) => `${b.surah}:${b.ayah}`)), [bookmarks]);
  const pageBookmarked = bookmarks.some((b) => b.page === data.page && b.surah === undefined);

  const firstSurah = quranRepository.getSurah(data.ayahs[0]?.surah ?? 0)?.nameAr ?? '';
  const innerWidth = width - 40;

  return (
    <Pressable
      onPress={onPagePress}
      accessible={false}
      style={{ width, height, backgroundColor: colors.bg, paddingHorizontal: 20 }}
    >
      {/* Running header: juz on the right, surah on the left (RTL), like a printed mushaf */}
      <View style={styles.header}>
        <AppText variant="caption" style={{ color: colors.frame }}>
          {juzLabel(data.juz)}
        </AppText>
        <AppText variant="caption" style={{ color: colors.frame }}>
          {firstSurah}
        </AppText>
      </View>

      <View style={styles.body}>
        {blocks.map((block) => {
          const surah = block.surahStart ? quranRepository.getSurah(block.surahStart) : undefined;
          return (
            <View key={block.key}>
              {surah ? (
                <View style={styles.surahHead}>
                  <SurahBanner name={surah.nameAr} color={colors.frame} bg="transparent" width={innerWidth} />
                  {surah.bismillahPre ? (
                    <Text style={[styles.basmala, { color: colors.text, fontFamily: fonts.quran, fontSize: Math.round(fontSize * 0.9) }]} allowFontScaling={false}>
                      {BASMALA}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <Text
                allowFontScaling={false}
                style={[styles.text, { color: colors.text, fontFamily: fonts.quran, fontSize, lineHeight: Math.round(fontSize * 2) }]}
              >
                {block.ayahs.map((a) => {
                  const marked = bookmarkedAyahs.has(`${a.surah}:${a.ayah}`);
                  const lit = highlight && highlight.surah === a.surah && highlight.ayah === a.ayah;
                  return (
                    <Text
                      key={`${a.surah}:${a.ayah}`}
                      onPress={() => onAyahPress(a)}
                      suppressHighlighting
                      style={marked || lit ? { backgroundColor: colors.highlight } : undefined}
                    >
                      {a.text}
                      <Text style={{ color: colors.frame, fontSize: Math.round(fontSize * 0.85) }}>{` ﴿${toArabicIndic(a.ayah)}﴾ `}</Text>
                    </Text>
                  );
                })}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        {pageBookmarked ? (
          <Svg width={14} height={18} viewBox="0 0 14 18" accessibilityLabel="الصفحة محفوظة">
            <Path d="M1 1h12v16l-6-4-6 4z" fill={colors.frame} />
          </Svg>
        ) : (
          <View style={{ width: 14 }} />
        )}
        <AppText variant="caption" style={{ color: colors.frame }}>
          {toArabicIndic(data.page)}
        </AppText>
        <View style={{ width: 14 }} />
      </View>
      {sample ? (
        <AppText variant="caption" align="center" style={[styles.sampleNote, { color: colors.frame }]}>
          نسخة تحقق مصغّرة — سيتم استيراد المصحف الكامل لاحقاً
        </AppText>
      ) : null}
    </Pressable>
  );
}

export const QuranPage = memo(QuranPageImpl);

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 4 },
  body: { flex: 1, justifyContent: 'center' },
  surahHead: { marginVertical: 10, gap: 6, alignItems: 'center' },
  basmala: { textAlign: 'center', marginTop: 4 },
  text: { textAlign: 'justify', writingDirection: 'rtl' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  sampleNote: { opacity: 0.8, paddingBottom: 6 },
});
