import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { PRIVACY_POLICY } from '@/constants/app';

export default function PrivacyScreen() {
  const { palette } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <ScreenHeader title="سياسة الخصوصية" />
      <ScrollView contentContainerStyle={styles.body}>
        {PRIVACY_POLICY.map((line, i) => (
          <AppText key={i} style={styles.line}>
            {line}
          </AppText>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: 20, gap: 14 },
  line: { lineHeight: 28 },
});
