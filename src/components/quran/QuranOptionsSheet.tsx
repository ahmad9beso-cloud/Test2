import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  Layers,
  Library,
  ListOrdered,
  Moon,
  Palette,
  Search,
  Settings,
  Trash,
  Type,
  type LucideIcon,
} from 'lucide-react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Chips, Segmented, Stepper } from '@/components/ui/SettingsRows';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, pageThemes, radius } from '@/theme/tokens';
import { FONT_SIZE_LIMITS } from '@/constants/app';
import { useSettings, type QuranSettings } from '@/store/settingsStore';
import { useQuran } from '@/store/quranStore';
import { quranRepository, type SearchHit } from '@/data/repositories/quranRepository';
import { fromArabicIndic, normalizeArabic, toArabicIndic } from '@/utils/arabic';
import type { Surah } from '@/domain/types';

type Panel = 'menu' | 'goto' | 'search' | 'size' | 'mode' | 'theme' | 'surahs' | 'bookmarks';

interface Props {
  visible: boolean;
  onClose: () => void;
  page: number;
  pageBookmarked: boolean;
  onToggleBookmark: () => void;
  /** Navigate to a bundled page (optionally highlighting an ayah). */
  onGoTo: (page: number, ayah?: { surah: number; ayah: number }) => void;
}

const TITLES: Record<Panel, string> = {
  menu: 'خيارات القرآن',
  goto: 'الانتقال إلى صفحة',
  search: 'البحث',
  size: 'حجم النص',
  mode: 'وضع القراءة',
  theme: 'مظهر الصفحة',
  surahs: 'فهرس السور',
  bookmarks: 'العلامات المرجعية',
};

export function QuranOptionsSheet({ visible, onClose, page, pageBookmarked, onToggleBookmark, onGoTo }: Props) {
  const router = useRouter();
  const { palette } = useTheme();
  const [panel, setPanel] = useState<Panel>('menu');

  useEffect(() => {
    if (visible) setPanel('menu');
  }, [visible]);

  const quran = useSettings((s) => s.quran);
  const patchQuran = useSettings((s) => s.patchQuran);
  const bookmarks = useQuran((s) => s.bookmarks);
  const removeBookmark = useQuran((s) => s.removeBookmark);

  const go = (p: number, ayah?: { surah: number; ayah: number }) => {
    onGoTo(p, ayah);
    onClose();
  };

  const action = (icon: LucideIcon, label: string, onPress: () => void, active = false) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.action, { backgroundColor: active ? palette.primarySoft : palette.surfaceAlt, borderColor: active ? palette.primary : 'transparent' }]}
    >
      <Icon icon={icon} size={24} color={active ? 'primary' : 'text'} />
      <AppText variant="caption" color={active ? 'primary' : 'text'} align="center">
        {label}
      </AppText>
    </Pressable>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title={TITLES[panel]} heightRatio={panel === 'menu' || panel === 'size' || panel === 'mode' || panel === 'theme' || panel === 'goto' ? undefined : 0.75}>
      {panel === 'menu' ? (
        <ScrollView contentContainerStyle={styles.menu}>
          {action(pageBookmarked ? BookmarkCheck : BookmarkIcon, pageBookmarked ? 'إزالة العلامة' : 'حفظ الصفحة', () => {
            onToggleBookmark();
          }, pageBookmarked)}
          {action(ListOrdered, 'الانتقال لصفحة', () => setPanel('goto'))}
          {action(Search, 'البحث', () => setPanel('search'))}
          {action(Type, 'حجم النص', () => setPanel('size'))}
          {action(Moon, 'وضع القراءة', () => setPanel('mode'))}
          {action(Palette, 'مظهر الصفحة', () => setPanel('theme'))}
          {action(Library, 'فهرس السور', () => setPanel('surahs'))}
          {action(Layers, 'العلامات', () => setPanel('bookmarks'))}
          {action(Settings, 'الإعدادات', () => {
            onClose();
            router.push('/settings');
          })}
        </ScrollView>
      ) : null}

      {panel === 'goto' ? <GoToPanel onGo={(p) => go(p)} /> : null}
      {panel === 'search' ? <SearchPanel onPick={(h) => go(h.page, { surah: h.surah, ayah: h.ayah })} /> : null}

      {panel === 'size' ? (
        <View style={styles.pad}>
          <View style={[styles.preview, { borderColor: palette.border }]}>
            <AppText style={{ fontFamily: fonts.quran, fontSize: quran.fontSize, lineHeight: quran.fontSize * 1.9 }} align="center">
              ٱلْحَمْدُ لِلَّهِ
            </AppText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Stepper
              label="حجم النص"
              value={quran.fontSize}
              min={FONT_SIZE_LIMITS.min}
              max={FONT_SIZE_LIMITS.max}
              step={FONT_SIZE_LIMITS.step}
              onChange={(fontSize) => patchQuran({ fontSize })}
              format={(v) => toArabicIndic(v)}
            />
          </View>
          <Button label="الحجم الافتراضي" variant="ghost" onPress={() => patchQuran({ fontSize: FONT_SIZE_LIMITS.default })} />
        </View>
      ) : null}

      {panel === 'mode' ? (
        <View style={styles.pad}>
          <Segmented<QuranSettings['readingMode']>
            value={quran.readingMode}
            onChange={(readingMode) => patchQuran({ readingMode })}
            options={[
              { value: 'app', label: 'حسب التطبيق' },
              { value: 'light', label: 'نهاري' },
              { value: 'dark', label: 'ليلي' },
            ]}
          />
          <AppText variant="caption" color="textMuted">
            يغيّر ألوان صفحة المصحف فقط دون تغيير مظهر بقية التطبيق.
          </AppText>
        </View>
      ) : null}

      {panel === 'theme' ? (
        <View style={styles.pad}>
          <Chips<QuranSettings['pageThemeId']>
            value={quran.pageThemeId}
            onChange={(pageThemeId) => patchQuran({ pageThemeId })}
            options={pageThemes.map((t) => ({ value: t.id, label: t.label }))}
          />
        </View>
      ) : null}

      {panel === 'surahs' ? <SurahIndexPanel onPick={(s) => go(s.startPage)} /> : null}

      {panel === 'bookmarks' ? (
        <FlatList
          data={bookmarks}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <AppText color="textMuted" align="center" style={{ padding: 24 }}>
              لا توجد علامات بعد. احفظ الصفحة من قائمة الخيارات أو اضغط على آية لحفظها.
            </AppText>
          }
          renderItem={({ item }) => {
            const surah = item.surah ? quranRepository.getSurah(item.surah)?.nameAr : undefined;
            const available = quranRepository.getPageNumbers().includes(item.page);
            return (
              <View style={[styles.listRow, { borderColor: palette.border }]}>
                <Pressable
                  accessibilityRole="button"
                  disabled={!available}
                  onPress={() => go(item.page, item.surah ? { surah: item.surah, ayah: item.ayah! } : undefined)}
                  style={{ flex: 1 }}
                >
                  <AppText variant="label">{surah ? `سورة ${surah} · الآية ${toArabicIndic(item.ayah!)}` : `صفحة ${toArabicIndic(item.page)}`}</AppText>
                  <AppText variant="caption" color="textMuted">
                    صفحة {toArabicIndic(item.page)}
                  </AppText>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="حذف العلامة" hitSlop={10} onPress={() => removeBookmark(item.id)} style={styles.trash}>
                  <Icon icon={Trash} size={20} color="danger" />
                </Pressable>
              </View>
            );
          }}
        />
      ) : null}

      {panel !== 'menu' ? (
        <View style={styles.back}>
          <Button label="رجوع" variant="ghost" onPress={() => setPanel('menu')} />
        </View>
      ) : null}
    </BottomSheet>
  );
}

/** Searchable surah index (فهرس): filter by name or number, jump to the surah's page. */
function SurahIndexPanel({ onPick }: { onPick: (surah: Surah) => void }) {
  const { palette } = useTheme();
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const q = normalizeArabic(query);
    const all = quranRepository.getSurahs();
    if (!q) return all;
    const qDigits = fromArabicIndic(q.replace(/[^٠-٩0-9]/g, '') || '-1');
    return all.filter(
      (s) => normalizeArabic(s.nameAr).includes(q) || String(s.id) === String(qDigits) || toArabicIndic(s.id) === query.trim(),
    );
  }, [query]);

  const complete = quranRepository.getManifest().complete;

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="ابحث عن سورة بالاسم أو الرقم"
        placeholderTextColor={palette.textMuted}
        accessibilityLabel="بحث في فهرس السور"
        style={[styles.input, styles.searchInput, { color: palette.text, borderColor: palette.border, backgroundColor: palette.surfaceAlt, fontFamily: fonts.regular }]}
        textAlign="right"
      />
      {!complete ? (
        <AppText variant="caption" color="textMuted" style={styles.searchNote}>
          السور المتوفرة في البيانات الحالية فقط — تكتمل القائمة عند استيراد المصحف.
        </AppText>
      ) : null}
      <FlatList
        data={data}
        keyExtractor={(s) => String(s.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <AppText color="textMuted" align="center" style={{ padding: 24 }}>
            لا توجد سورة بهذا الاسم.
          </AppText>
        }
        renderItem={({ item }) => {
          const available = quranRepository.getPageNumbers().includes(item.startPage);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !available }}
              disabled={!available}
              onPress={() => onPick(item)}
              style={[styles.listRow, { borderColor: palette.border, opacity: available ? 1 : 0.45 }]}
            >
              <AppText variant="caption" color="gold" style={styles.num}>
                {toArabicIndic(item.id)}
              </AppText>
              <AppText variant="label" style={{ flex: 1 }}>
                {item.nameAr}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {available ? `صفحة ${toArabicIndic(item.startPage)}` : 'غير متوفرة'}
              </AppText>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

function GoToPanel({ onGo }: { onGo: (page: number) => void }) {
  const { palette } = useTheme();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const manifest = quranRepository.getManifest();

  const submit = () => {
    const n = fromArabicIndic(value);
    if (!Number.isFinite(n) || n < 1 || n > manifest.totalPages) {
      setError(`أدخل رقماً بين ١ و ${toArabicIndic(manifest.totalPages)}`);
      return;
    }
    if (!quranRepository.getPageNumbers().includes(n)) {
      setError('هذه الصفحة غير متوفرة بعد في البيانات الحالية.');
      return;
    }
    onGo(n);
  };

  return (
    <View style={styles.pad}>
      <TextInput
        value={value}
        onChangeText={(t) => {
          setValue(t);
          setError(null);
        }}
        keyboardType="number-pad"
        placeholder={`رقم الصفحة (١–${toArabicIndic(manifest.totalPages)})`}
        placeholderTextColor={palette.textMuted}
        accessibilityLabel="رقم الصفحة"
        onSubmitEditing={submit}
        returnKeyType="go"
        style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.surfaceAlt, fontFamily: fonts.regular }]}
        textAlign="right"
      />
      {error ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : null}
      <Button label="انتقال" onPress={submit} />
    </View>
  );
}

function SearchPanel({ onPick }: { onPick: (hit: SearchHit) => void }) {
  const { palette } = useTheme();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const run = useRef(0);

  useEffect(() => {
    const id = ++run.current;
    if (query.trim().length < 2) {
      setHits(null);
      return;
    }
    setBusy(true);
    const t = setTimeout(async () => {
      const res = await quranRepository.search(query);
      if (id === run.current) {
        setHits(res);
        setBusy(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const manifest = quranRepository.getManifest();

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="ابحث في الآيات (بدون تشكيل)"
        placeholderTextColor={palette.textMuted}
        accessibilityLabel="بحث في القرآن"
        style={[styles.input, styles.searchInput, { color: palette.text, borderColor: palette.border, backgroundColor: palette.surfaceAlt, fontFamily: fonts.regular }]}
        textAlign="right"
      />
      {!manifest.complete ? (
        <AppText variant="caption" color="textMuted" style={styles.searchNote}>
          البحث يشمل البيانات المتوفرة حالياً فقط.
        </AppText>
      ) : null}
      <FlatList
        data={hits ?? []}
        keyExtractor={(h) => `${h.surah}:${h.ayah}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <AppText color="textMuted" align="center" style={{ padding: 24 }}>
            {busy ? 'جارٍ البحث…' : hits ? 'لا توجد نتائج.' : 'اكتب كلمتين على الأقل للبحث.'}
          </AppText>
        }
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => onPick(item)} style={[styles.listRow, { borderColor: palette.border, alignItems: 'flex-start' }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText style={{ fontFamily: fonts.quran, fontSize: 20, lineHeight: 36 }} numberOfLines={2}>
                {item.text}
              </AppText>
              <AppText variant="caption" color="gold">
                {quranRepository.getSurah(item.surah)?.nameAr} · الآية {toArabicIndic(item.ayah)} · صفحة {toArabicIndic(item.page)}
              </AppText>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  menu: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16, justifyContent: 'center' },
  action: { width: '30%', minWidth: 96, minHeight: 88, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8 },
  pad: { padding: 16, gap: 14 },
  preview: { borderWidth: 1, borderRadius: radius.md, paddingVertical: 10, minHeight: 90, justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  listRow: { minHeight: 56, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  num: { width: 30, textAlign: 'center' },
  trash: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  back: { paddingHorizontal: 16, paddingTop: 8 },
  input: { minHeight: 52, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 16, fontSize: 17 },
  searchInput: { marginHorizontal: 16, marginBottom: 6 },
  searchNote: { paddingHorizontal: 20, marginBottom: 6 },
});
