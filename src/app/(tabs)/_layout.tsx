import React from 'react';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useSettings } from '@/store/settingsStore';

export default function TabsLayout() {
  const onboardingDone = useSettings((s) => s.onboardingDone);
  if (!onboardingDone) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false, lazy: true }}
    >
      {/* Order matters: with RTL layout the first tab is rendered on the right. */}
      <Tabs.Screen name="quran" options={{ title: 'القرآن' }} />
      <Tabs.Screen name="index" options={{ title: 'الرئيسية' }} />
      <Tabs.Screen name="azkar" options={{ title: 'الأذكار' }} />
    </Tabs>
  );
}
