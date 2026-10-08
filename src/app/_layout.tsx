import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold } from '@expo-google-fonts/tajawal';
import { AmiriQuran_400Regular } from '@expo-google-fonts/amiri-quran';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { useSettings } from '@/store/settingsStore';
import { useQuran } from '@/store/quranStore';
import { useAzkar } from '@/store/azkarStore';
import { configureNotifications, setupChannels } from '@/services/notifications';
import { refreshGpsIfStale } from '@/services/location';
import { useNotificationSync } from '@/hooks/useNotificationSync';
import { ThemeTransitionOverlay } from '@/components/ui/ThemeTransitionOverlay';
import { ZikrOverlay } from '@/components/ui/ZikrOverlay';

SplashScreen.preventAutoHideAsync().catch(() => {});
configureNotifications();

function Shell() {
  const { palette, isDark } = useTheme();
  const router = useRouter();

  useNotificationSync();

  useEffect(() => {
    setupChannels().catch(() => {});
  }, []);

  // Silent GPS refresh (only if permission was already granted and the saved fix is old).
  useEffect(() => {
    const { location, setLocation } = useSettings.getState();
    refreshGpsIfStale(location).then((fresh) => fresh && setLocation(fresh));
  }, []);

  // Tapping a reminder opens the relevant screen.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route;
      if (typeof route === 'string') router.push(route as never);
    });
    return () => sub.remove();
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom', contentStyle: { backgroundColor: palette.bg } }}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="azkar/[categoryId]" />
        <Stack.Screen name="qibla" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="location" />
        <Stack.Screen name="privacy" />
      </Stack>
      {/* Animated sun/moon fade shown when the theme switches. */}
      <ThemeTransitionOverlay />
      {/* Full-zikr reminder shown while the app is open. */}
      <ZikrOverlay />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    AmiriQuran_400Regular,
  });
  const settingsReady = useSettings((s) => s.hydrated);
  const quranReady = useQuran((s) => s.hydrated);
  const azkarReady = useAzkar((s) => s.hydrated);

  const ready = (fontsLoaded || !!fontError) && settingsReady && quranReady && azkarReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Shell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
