import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, type Palette } from '@/theme/tokens';

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';
export type TextColor = keyof Pick<
  Palette,
  'text' | 'textMuted' | 'primary' | 'gold' | 'onPrimary' | 'danger'
>;

const variants: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fonts.bold, fontSize: 44, lineHeight: 56 },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 36 },
  heading: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 28 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 26 },
  label: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
};

interface Props extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  align?: TextStyle['textAlign'];
}

/** Base text. Arabic text is right-aligned by the RTL layout; `align` overrides when needed. */
export function AppText({ variant = 'body', color = 'text', align, style, ...rest }: Props) {
  const { palette } = useTheme();
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={1.4}
      {...rest}
      style={[variants[variant], { color: palette[color] }, align ? { textAlign: align } : null, style]}
    />
  );
}
