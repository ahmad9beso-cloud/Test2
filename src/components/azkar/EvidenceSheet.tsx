import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';
import type { DhikrEvidence } from '@/domain/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  evidence?: DhikrEvidence;
}

/** Shows only fields that exist in the data — nothing is ever invented. */
export function EvidenceSheet({ visible, onClose, evidence }: Props) {
  const { palette } = useTheme();
  const has = evidence && (evidence.text || evidence.narrator || evidence.source || evidence.grade);

  const meta = (label: string, value?: string) =>
    value ? (
      <View style={[styles.meta, { borderColor: palette.border }]}>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <AppText variant="label" style={{ flex: 1 }} align="left">
          {value}
        </AppText>
      </View>
    ) : null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="الدليل">
      <ScrollView contentContainerStyle={styles.body}>
        {has ? (
          <>
            {evidence?.text ? (
              <AppText style={{ fontFamily: fonts.quran, fontSize: 22, lineHeight: 42 }} align="center">
                {evidence.text}
              </AppText>
            ) : null}
            <View style={{ gap: 8 }}>
              {meta('الراوي', evidence?.narrator)}
              {meta('المصدر', evidence?.source)}
              {meta('الدرجة', evidence?.grade)}
            </View>
          </>
        ) : (
          <AppText color="textMuted" align="center">
            لم يُضَف دليل لهذا الذكر بعد.
          </AppText>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, gap: 18 },
  meta: { flexDirection: 'row', gap: 12, alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
});
