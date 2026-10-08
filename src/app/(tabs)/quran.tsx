import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, useWindowDimensions, View, type ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Bookmark, BookmarkCheck, ChevronUp } from 'lucide-react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { QuranPage } from '@/components/quran/QuranPage';
import { QuranOptionsSheet } from '@/components/quran/QuranOptionsSheet';
import { useTheme } from '@/theme/ThemeProvider';
import { pageThemes } from '@/theme/tokens';
import { useSettings } from '@/store/settingsStore';
import { useQuran } from '@/store/quranStore';
import { quranRepository } from '@/data/repositories/quranRepository';
import { haptic } from '@/services/haptics';
import { toArabicIndic } from '@/utils/arabic';
import type { Ayah } from '@/domain/types';

const CONTROLS_MS = 3000;

export default function QuranScreen() {
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  const quran = useSettings((s) => s.quran);
  const bookmarks = useQuran((s) => s.bookmarks);
  const position = useQuran((s) => s.position);
  const setPosition = useQuran((s) => s.setPosition);
  const togglePageBookmark = useQuran((s) => s.togglePageBookmark);
  const toggleAyahBookmark = useQuran((s) => s.toggleAyahBookmark);

  const pages = useMemo(() => quranRepository.getPageNumbers(), []);
  const manifest = quranRepository.getManifest();

  const startIndex = useMemo(() => {
    const i = position ? pages.indexOf(position.page) : -1;
    return i >= 0 ? i : 0;
    // only the position at mount decides the first page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [index, setIndex] = useState(startIndex);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [ayahSheet, setAyahSheet] = useState<{ ayah: Ayah; page: number } | null>(null);
  const [highlight, setHighlight] = useState<{ surah: number; ayah: number } | null>(
    position?.surah && position.ayah ? { surah: position.surah, ayah: position.ayah } : null,
  );

  const listRef = useRef<FlatList<number>>(null);

  // ─── temporary controls (appear on tap, fade out by themselves) ───
  const controls = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [controlsOn, setControlsOn] = useState(false);

  const showControls = useCallback(() => {
    setControlsOn(true);
    Animated.timing(controls, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      Animated.timing(controls, { toValue: 0, duration: 260, useNativeDriver: true }).start(({ finished }) => finished && setControlsOn(false));
    }, CONTROLS_MS);
  }, [controls]);

  const hideControlsNow = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    controls.setValue(0);
    setControlsOn(false);
  }, [controls]);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  // ─── reading position: saved automatically on every page change ───
  const currentPage = pages[index] ?? pages[0];
  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems.find((v) => v.isViewable && v.index != null);
    if (first?.index != null) {
      setIndex(first.index);
      const data = quranRepository.getPage(pages[first.index]);
      setPosition({ page: pages[first.index], surah: data?.ayahs[0]?.surah, ayah: data?.ayahs[0]?.ayah });
      setHighlight(null);
    }
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const goToPage = useCallback(
    (page: number, ayah?: { surah: number; ayah: number }) => {
      const i = pages.indexOf(page);
      if (i < 0) return;
      listRef.current?.scrollToIndex({ index: i, animated: false });
      setIndex(i);
      setPosition({ page, surah: ayah?.surah, ayah: ayah?.ayah });
      setHighlight(ayah ?? null);
    },
    [pages, setPosition],
  );

  const pageTheme = pageThemes.find((t) => t.id === quran.pageThemeId) ?? pageThemes[0];
  const pageDark = quran.readingMode === 'app' ? isDark : quran.readingMode === 'dark';
  const frame = (pageDark ? pageTheme.dark : pageTheme.light);

  const pageBookmarked = bookmarks.some((b) => b.page === currentPage && b.surah === undefined);

  const onAyahPress = useCallback(
    (ayah: Ayah) => {
      haptic.tick();
      setAyahSheet({ ayah, page: quranRepository.findPageOfAyah(ayah.surah, ayah.ayah) ?? currentPage });
    },
    [currentPage],
  );

  const renderItem = useCallback(
    ({ item }: { item: number }) => {
      const data = quranRepository.getPage(item);
      if (!data) {
        return (
          <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
            <AppText color="textMuted">الصفحة {toArabicIndic(item)} غير متوفرة بعد</AppText>
          </View>
        );
      }
      return (
        <QuranPage
          data={data}
          width={width}
          height={height - insets.top}
          fontSize={quran.fontSize}
          pageTheme={pageTheme}
          dark={pageDark}
          bookmarks={bookmarks}
          highlight={item === currentPage ? highlight : null}
          sample={!manifest.complete}
          onAyahPress={onAyahPress}
          onPagePress={showControls}
        />
      );
    },
    [width, height, insets.top, quran.fontSize, pageTheme, pageDark, bookmarks, highlight, currentPage, manifest.complete, onAyahPress, showControls],
  );

  if (!quranRepository.hasData()) {
    return (
      <View style={[styles.root, { backgroundColor: palette.bg, paddingTop: insets.top }]}>
        <EmptyState
          icon={BookOpen}
          title="المصحف غير متوفر بعد"
          message="سيتم توفير المحتوى القرآني هنا عند إضافة بيانات المصحف."
        />
      </View>
    );
  }

  const ayahBookmarked = ayahSheet ? bookmarks.some((b) => b.surah === ayahSheet.ayah.surah && b.ayah === ayahSheet.ayah.ayah) : false;
  const ayahSurahName = ayahSheet ? quranRepository.getSurah(ayahSheet.ayah.surah)?.nameAr : '';

  return (
    <View style={[styles.root, { backgroundColor: frame.bg, paddingTop: insets.top }]}>
      <FlatList
        ref={listRef}
        data={pages}
        horizontal
        pagingEnabled
        keyExtractor={(p) => String(p)}
        renderItem={renderItem}
        initialScrollIndex={startIndex}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={viewabilityConfig}
        onScrollBeginDrag={hideControlsNow}
        extraData={`${quran.fontSize}|${quran.pageThemeId}|${pageDark}|${bookmarks.length}|${highlight?.ayah}`}
      />

      {/* Temporary top strip */}
      {controlsOn ? (
        <Animated.View
          style={[styles.topStrip, { top: insets.top + 6, opacity: controls, backgroundColor: palette.surface, borderColor: palette.border }]}
          pointerEvents="box-none"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={pageBookmarked ? 'إزالة علامة الصفحة' : 'حفظ الصفحة'}
            onPress={() => {
              const on = togglePageBookmark(currentPage);
              on ? haptic.success() : haptic.tick();
              showControls();
            }}
            style={styles.stripBtn}
          >
            <Icon icon={pageBookmarked ? BookmarkCheck : Bookmark} size={22} color={pageBookmarked ? 'gold' : 'text'} />
          </Pressable>
          <AppText variant="label">صفحة {toArabicIndic(currentPage)}</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel="خيارات القرآن" onPress={() => setOptionsOpen(true)} style={styles.stripBtn}>
            <Icon icon={ChevronUp} size={22} />
          </Pressable>
        </Animated.View>
      ) : null}

      {/* Small always-available button for the options sheet */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="خيارات القرآن"
        onPress={() => {
          hideControlsNow();
          setOptionsOpen(true);
        }}
        style={[styles.fab, { backgroundColor: palette.surface, borderColor: palette.border }]}
      >
        <Icon icon={ChevronUp} size={22} color="primary" />
      </Pressable>

      <QuranOptionsSheet
        visible={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        page={currentPage}
        pageBookmarked={pageBookmarked}
        onToggleBookmark={() => (togglePageBookmark(currentPage) ? haptic.success() : haptic.tick())}
        onGoTo={goToPage}
      />

      <BottomSheet visible={!!ayahSheet} onClose={() => setAyahSheet(null)} title={ayahSheet ? `سورة ${ayahSurahName} · الآية ${toArabicIndic(ayahSheet.ayah.ayah)}` : undefined}>
        <View style={styles.ayahBody}>
          <Button
            label={ayahBookmarked ? 'إزالة علامة الآية' : 'حفظ علامة على الآية'}
            icon={ayahBookmarked ? BookmarkCheck : Bookmark}
            onPress={() => {
              if (!ayahSheet) return;
              const on = toggleAyahBookmark(ayahSheet.page, ayahSheet.ayah.surah, ayahSheet.ayah.ayah);
              on ? haptic.success() : haptic.tick();
              setAyahSheet(null);
            }}
          />
          <Button label="متابعة القراءة من هنا" variant="soft" onPress={() => {
            if (ayahSheet) setPosition({ page: ayahSheet.page, surah: ayahSheet.ayah.surah, ayah: ayahSheet.ayah.ayah });
            setAyahSheet(null);
          }} />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topStrip: { position: 'absolute', left: 24, right: 24, minHeight: 52, borderRadius: 26, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, elevation: 3 },
  stripBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', bottom: 14, alignSelf: 'center', width: 48, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', opacity: 0.92 },
  ayahBody: { padding: 16, gap: 10 },
});
