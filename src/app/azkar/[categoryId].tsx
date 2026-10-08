import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpenCheck, CircleCheck, HandHeart, RotateCcw, SkipBack, SkipForward } from 'lucide-react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EvidenceSheet } from '@/components/azkar/EvidenceSheet';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';
import { azkarRepository } from '@/data/repositories/azkarRepository';
import { readProgress, useAzkar } from '@/store/azkarStore';
import { useSettings } from '@/store/settingsStore';
import { haptic } from '@/services/haptics';
import { toArabicIndic } from '@/utils/arabic';

export default function DhikrScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();

  const category = azkarRepository.getCategory(categoryId);
  const items = useMemo(() => azkarRepository.getItems(categoryId), [categoryId]);

  const progress = useAzkar((s) => s.progress);
  const increment = useAzkar((s) => s.increment);
  const resetItem = useAzkar((s) => s.resetItem);
  const resetCategory = useAzkar((s) => s.resetCategory);
  const setIndexStore = useAzkar((s) => s.setIndex);
  const { autoNext, haptics } = useSettings((s) => s.azkar);

  const p = readProgress(progress, categoryId);
  const index = Math.min(Math.max(p.index, 0), Math.max(items.length - 1, 0));
  const item = items[index];
  const count = item ? p.counts[item.id] ?? 0 : 0;
  const complete = !!item && count >= item.count;
  const allDone = items.length > 0 && items.every((d) => (p.counts[d.id] ?? 0) >= d.count);

  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (nextTimer.current) clearTimeout(nextTimer.current); }, []);

  // Soft fade whenever the shown dhikr changes.
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [index, fade]);

  const goTo = (i: number) => {
    if (i < 0 || i >= items.length) return;
    setIndexStore(categoryId, i);
  };

  const press = () => {
    if (!item || complete) return;
    const next = increment(categoryId, item.id, item.count);
    if (next >= item.count) {
      if (haptics) haptic.success();
      if (autoNext && index < items.length - 1) {
        nextTimer.current = setTimeout(() => goTo(index + 1), 450);
      }
    } else if (haptics) {
      haptic.light();
    }
  };

  if (!category) {
    return (
      <View style={[styles.root, { backgroundColor: palette.bg }]}>
        <ScreenHeader title="الأذكار" />
        <EmptyState icon={HandHeart} title="هذا التصنيف غير موجود" />
      </View>
    );
  }

  if (items.length === 0 || !item) {
    return (
      <View style={[styles.root, { backgroundColor: palette.bg }]}>
        <ScreenHeader title={category.title} />
        <EmptyState icon={HandHeart} title="لا توجد أذكار في هذا التصنيف بعد" message="سيتم إضافة الأذكار هنا عند توفّر بيانات الأذكار." />
      </View>
    );
  }

  const ratio = Math.min(1, count / item.count);

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <ScreenHeader
        title={category.title}
        trailing={
          <AppText variant="caption" color="textMuted">
            {toArabicIndic(index + 1)} / {toArabicIndic(items.length)}
          </AppText>
        }
      />

      <ScrollView contentContainerStyle={styles.body}>
        {allDone ? (
          <View style={[styles.banner, { backgroundColor: palette.primarySoft }]}>
            <Icon icon={CircleCheck} size={20} color="primary" />
            <AppText variant="label" color="primary" style={{ flex: 1 }}>
              أتممت جميع أذكار هذا القسم اليوم
            </AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="إعادة القسم من البداية" onPress={() => resetCategory(categoryId)} hitSlop={8}>
              <AppText variant="label" color="primary">
                إعادة
              </AppText>
            </Pressable>
          </View>
        ) : null}

        <Animated.View style={{ opacity: fade, gap: 18 }}>
          <AppText style={{ fontFamily: fonts.quran, fontSize: 30, lineHeight: 62 }} align="center">
            {item.text}
          </AppText>

          {item.virtue ? (
            <AppText variant="caption" color="textMuted" align="center">
              {item.virtue}
            </AppText>
          ) : null}

          <AppText variant="heading" color="gold" align="center">
            {toArabicIndic(item.count)} {item.count === 1 ? 'مرة' : item.count === 2 ? 'مرتان' : item.count <= 10 ? 'مرات' : 'مرة'}
          </AppText>
        </Animated.View>

        <View style={styles.counterWrap}>
          <AppText variant="display" align="center" style={{ writingDirection: 'ltr' }} accessibilityLiveRegion="polite">
            {toArabicIndic(count)} / {toArabicIndic(item.count)}
          </AppText>
          <View style={[styles.track, { backgroundColor: palette.border }]}>
            <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: palette.primary }]} />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={complete ? 'اكتمل الذكر' : `اضغط للذكر، العدد ${count} من ${item.count}`}
          accessibilityState={{ disabled: complete }}
          onPress={press}
          android_ripple={{ color: palette.primarySoft, radius: 140 }}
          style={({ pressed }) => [
            styles.bigBtn,
            { backgroundColor: complete ? palette.primarySoft : palette.primary, opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
          ]}
        >
          {complete ? <Icon icon={CircleCheck} size={28} color="primary" /> : null}
          <AppText variant="heading" color={complete ? 'primary' : 'onPrimary'}>
            {complete ? 'اكتمل الذكر' : 'اضغط للذكر'}
          </AppText>
        </Pressable>

        <View style={styles.controls}>
          <Pressable accessibilityRole="button" accessibilityLabel="الذكر السابق" disabled={index === 0} onPress={() => goTo(index - 1)} style={[styles.ctl, { opacity: index === 0 ? 0.35 : 1, backgroundColor: palette.surfaceAlt }]}>
            <Icon icon={SkipForward} size={22} />
            <AppText variant="caption">السابق</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="إعادة العداد" onPress={() => resetItem(categoryId, item.id)} style={[styles.ctl, { backgroundColor: palette.surfaceAlt }]}>
            <Icon icon={RotateCcw} size={22} />
            <AppText variant="caption">إعادة</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="تخطي الذكر" disabled={index >= items.length - 1} onPress={() => goTo(index + 1)} style={[styles.ctl, { opacity: index >= items.length - 1 ? 0.35 : 1, backgroundColor: palette.surfaceAlt }]}>
            <Icon icon={SkipBack} size={22} />
            <AppText variant="caption">{complete ? 'التالي' : 'تخطي'}</AppText>
          </Pressable>
        </View>

        <Button label="الدليل" variant="soft" icon={BookOpenCheck} onPress={() => setEvidenceOpen(true)} />
        <View style={{ height: insets.bottom }} />
      </ScrollView>

      <EvidenceSheet visible={evidenceOpen} onClose={() => setEvidenceOpen(false)} evidence={item.evidence} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: 22, paddingBottom: 24, gap: 18 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, padding: 12 },
  counterWrap: { gap: 10, marginTop: 4 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  bigBtn: { minHeight: 96, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  controls: { flexDirection: 'row', gap: 10 },
  ctl: { flex: 1, minHeight: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 2 },
});
