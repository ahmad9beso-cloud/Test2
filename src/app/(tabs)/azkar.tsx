import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BedDouble,
  HandHeart,
  Landmark,
  MoonStar,
  ShieldCheck,
  Sunrise,
  SunMedium,
  Utensils,
  Plane,
  Droplets,
  House,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';
import { AppText } from '@/components/ui/AppText';
import { ForwardChevron, Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/theme/ThemeProvider';
import { azkarRepository } from '@/data/repositories/azkarRepository';
import { readProgress, useAzkar } from '@/store/azkarStore';
import { toArabicIndic } from '@/utils/arabic';
import { radius } from '@/theme/tokens';

/** A distinct icon per azkar category (fallback: HandHeart). */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  morning: SunMedium,
  evening: MoonStar,
  sleep: BedDouble,
  wakeup: Sunrise,
  'after-prayer': Landmark,
  hisn: ShieldCheck,
  travel: Plane,
  'home-enter': House,
  'home-exit': House,
  food: Utensils,
  mosque: Landmark,
  wudu: Droplets,
  misc: Sparkles,
};

export default function AzkarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const progress = useAzkar((s) => s.progress);
  const categories = azkarRepository.getCategories();

  return (
    <View style={[styles.root, { backgroundColor: palette.bg, paddingTop: insets.top + 12 }]}>
      <AppText variant="title" style={styles.title} accessibilityRole="header">
        الأذكار
      </AppText>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon={HandHeart} title="لا توجد أذكار بعد" message="ستظهر التصنيفات هنا عند إضافة بيانات الأذكار." />}
        renderItem={({ item }) => {
          const items = azkarRepository.getItems(item.id);
          const p = readProgress(progress, item.id);
          const done = items.filter((d) => (p.counts[d.id] ?? 0) >= d.count).length;
          const empty = items.length === 0;
          const allDone = !empty && done === items.length;
          const ratio = empty ? 0 : done / items.length;
          const Glyph = CATEGORY_ICONS[item.id] ?? HandHeart;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title}، ${empty ? 'لا توجد أذكار بعد' : `${done} من ${items.length} مكتمل`}`}
              onPress={() => router.push({ pathname: '/azkar/[categoryId]', params: { categoryId: item.id } })}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: palette.surface, borderColor: allDone ? palette.primary : palette.border, opacity: pressed ? 0.92 : 1 },
              ]}
            >
              <View style={[styles.cardIcon, { backgroundColor: palette.primarySoft }]}>
                <Icon icon={Glyph} size={24} color={allDone ? 'primary' : 'primary'} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="heading">{item.title}</AppText>
                <AppText variant="caption" color="textMuted">
                  {empty ? 'سيتم إضافة الأذكار هنا' : allDone ? 'أتممتها اليوم' : `${toArabicIndic(done)} / ${toArabicIndic(items.length)} اليوم`}
                </AppText>
                {!empty ? (
                  <View style={[styles.progressTrack, { backgroundColor: palette.border }]}>
                    <View style={[styles.progressFill, { width: `${ratio * 100}%`, backgroundColor: allDone ? palette.primary : palette.gold }]} />
                  </View>
                ) : null}
              </View>
              <Icon icon={ForwardChevron} size={20} color="textMuted" />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { paddingHorizontal: 24, marginBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 6, width: '70%' },
  progressFill: { height: 4, borderRadius: 2 },
});
