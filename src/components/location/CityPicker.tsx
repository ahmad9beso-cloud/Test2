import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ChevronDown, ChevronUp, Globe, Search } from 'lucide-react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/tokens';
import { CITIES, type City } from '@/data/cities';
import { normalizeArabic } from '@/utils/arabic';

interface Props {
  selectedId?: string;
  onSelect: (city: City) => void;
}

type Section =
  | { kind: 'country'; country: string; key: string }
  | { kind: 'city'; city: City; key: string };

/** Arabic ordinal-free country order: Syria and the Levant first, then the Arab world, then the rest. */
const COUNTRY_ORDER = [
  'سوريا',
  'فلسطين',
  'الأردن',
  'لبنان',
  'العراق',
  'مصر',
  'السعودية',
  'الكويت',
  'قطر',
  'الإمارات',
  'عُمان',
  'اليمن',
  'السودان',
  'ليبيا',
  'تونس',
  'الجزائر',
  'المغرب',
];

/**
 * Two-level picker: countries first (collapsible), then a searchable city list.
 * Works with no permission and no internet.
 */
export function CityPicker({ selectedId, onSelect }: Props) {
  const { palette } = useTheme();
  const [query, setQuery] = useState('');
  const [openCountries, setOpenCountries] = useState<string[]>(() => COUNTRY_ORDER.slice(0, 1));

  const searching = query.trim().length > 0;

  const matches = useMemo(() => {
    const q = normalizeArabic(query);
    if (!q) return CITIES;
    return CITIES.filter((c) => normalizeArabic(`${c.nameAr} ${c.country}`).includes(q));
  }, [query]);

  const grouped = useMemo(() => {
    const byCountry = new Map<string, City[]>();
    for (const c of matches) {
      if (!byCountry.has(c.country)) byCountry.set(c.country, []);
      byCountry.get(c.country)!.push(c);
    }
    const known = COUNTRY_ORDER.filter((country) => byCountry.has(country));
    const extra = [...byCountry.keys()].filter((country) => !COUNTRY_ORDER.includes(country)).sort();
    return [...known, ...extra].map((country) => ({ country, cities: byCountry.get(country)! }));
  }, [matches]);

  const sections: Section[] = useMemo(() => {
    const out: Section[] = [];
    for (const g of grouped) {
      const isOpen = searching || openCountries.includes(g.country);
      if (isOpen) out.push({ kind: 'country', country: g.country, key: `c-${g.country}` });
      if (searching || isOpen) {
        for (const city of g.cities) out.push({ kind: 'city', city, key: city.id });
      }
    }
    return out;
  }, [grouped, openCountries, searching]);

  const toggleCountry = (country: string) =>
    setOpenCountries((open) => (open.includes(country) ? open.filter((c) => c !== country) : [...open, country]));

  const selectedCity = CITIES.find((c) => c.id === selectedId);

  const renderRow = ({ item }: { item: Section }) => {
    if (item.kind === 'country') {
      const isOpen = searching || openCountries.includes(item.country);
      const count = grouped.find((g) => g.country === item.country)?.cities.length ?? 0;
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`قائمة مدن ${item.country}`}
          accessibilityState={{ expanded: isOpen }}
          onPress={() => toggleCountry(item.country)}
          style={[styles.countryRow, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}
        >
          <Icon icon={Globe} size={18} color="primary" />
          <AppText variant="heading" style={styles.countryName}>
            {item.country}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {`(${count} مدينة)`}
          </AppText>
          <Icon icon={isOpen ? ChevronUp : ChevronDown} size={18} color="textMuted" />
        </Pressable>
      );
    }
    const city = item.city;
    const selected = city.id === selectedId;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${city.nameAr}، ${city.country}`}
        onPress={() => onSelect(city)}
        style={[
          styles.cityRow,
          {
            borderColor: selected ? palette.primary : palette.border,
            backgroundColor: selected ? palette.primarySoft : palette.surface,
          },
        ]}
      >
        <AppText variant="label">{city.nameAr}</AppText>
        {selected ? (
          <AppText variant="caption" color="primary">
            المختارة
          </AppText>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.search, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
        <Icon icon={Search} size={20} color="textMuted" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ابحث عن مدينة أو دولة"
          placeholderTextColor={palette.textMuted}
          accessibilityLabel="بحث عن مدينة"
          style={[styles.input, { color: palette.text, fontFamily: fonts.regular }]}
          textAlign="right"
        />
        {selectedCity && !searching ? (
          <AppText variant="caption" color="primary" style={styles.current}>
            {`الحالية: ${selectedCity.nameAr}`}
          </AppText>
        ) : null}
      </View>
      <FlatList
        data={sections}
        keyExtractor={(s) => s.key}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <AppText color="textMuted" align="center" style={{ padding: 24 }}>
            لا توجد مدينة أو دولة بهذا الاسم في القائمة.
          </AppText>
        }
        renderItem={renderRow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 14, minHeight: 48, borderRadius: radius.pill, borderWidth: 1 },
  input: { flex: 1, fontSize: 16, paddingVertical: 8 },
  current: { maxWidth: 110 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  countryRow: { minHeight: 52, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  countryName: { flex: 1 },
  cityRow: { minHeight: 52, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: 10, marginStart: 18 },
});
