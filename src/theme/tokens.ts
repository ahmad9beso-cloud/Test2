/** Design tokens. Calm green + warm ivory, restrained gold accents. */

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  gold: string;
  border: string;
  danger: string;
  overlay: string;
  isDark: boolean;
}

export const lightPalette: Palette = {
  bg: '#FBF8F1',
  surface: '#FFFEFB',
  surfaceAlt: '#F3EFE3',
  text: '#2B2A26',
  textMuted: '#6B675C',
  primary: '#3E6B52',
  primarySoft: '#E4EDE5',
  onPrimary: '#FFFFFF',
  gold: '#A98A4E',
  border: '#E7E1D3',
  danger: '#A8402F',
  overlay: 'rgba(30,30,25,0.38)',
  isDark: false,
};

export const darkPalette: Palette = {
  bg: '#16201C',
  surface: '#1D2A25',
  surfaceAlt: '#24332D',
  text: '#EFE9DA',
  textMuted: '#A9A393',
  primary: '#86B79A',
  primarySoft: '#26382F',
  onPrimary: '#10201A',
  gold: '#C2A56B',
  border: '#2E3E37',
  danger: '#E08A7A',
  overlay: 'rgba(0,0,0,0.55)',
  isDark: true,
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

export const fonts = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
  /**
   * Quran text font. Amiri Quran is a real Uthmani-style Quran face bundled for development.
   * To use a dedicated mushaf font (e.g. KFGQPC Uthmani Hafs), add the font file,
   * load it in `src/app/_layout.tsx` and change this single value.
   */
  quran: 'AmiriQuran_400Regular',
} as const;

/** Page appearance used by the Quran reader ("مظهر الصفحة"). */
export interface PageTheme {
  id: 'classic' | 'paper' | 'sepia';
  label: string;
  light: { bg: string; text: string; frame: string; highlight: string };
  dark: { bg: string; text: string; frame: string; highlight: string };
}

export const pageThemes: PageTheme[] = [
  {
    id: 'classic',
    label: 'عاجي',
    light: { bg: '#FBF7EC', text: '#1F1D18', frame: '#B9A06A', highlight: '#F1D9D2' },
    dark: { bg: '#121814', text: '#EFE9DA', frame: '#9C8757', highlight: '#3A2F2B' },
  },
  {
    id: 'paper',
    label: 'أبيض',
    light: { bg: '#FFFFFF', text: '#1A1A18', frame: '#8A8168', highlight: '#EFE3DF' },
    dark: { bg: '#0D1210', text: '#ECE7DA', frame: '#8A8168', highlight: '#33292A' },
  },
  {
    id: 'sepia',
    label: 'دافئ',
    light: { bg: '#F2E8D3', text: '#2D2418', frame: '#A88B57', highlight: '#E7CDBE' },
    dark: { bg: '#17130D', text: '#E8DCC3', frame: '#9C8757', highlight: '#3B2E26' },
  },
];
