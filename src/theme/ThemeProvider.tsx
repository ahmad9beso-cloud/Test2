import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettings } from '@/store/settingsStore';
import { darkPalette, lightPalette, type Palette } from './tokens';

interface ThemeValue {
  palette: Palette;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeValue>({ palette: lightPalette, isDark: false });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSettings((s) => s.theme);
  const system = useColorScheme();

  const value = useMemo<ThemeValue>(() => {
    const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
    return { isDark, palette: isDark ? darkPalette : lightPalette };
  }, [mode, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
