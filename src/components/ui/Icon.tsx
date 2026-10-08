import React from 'react';
import { I18nManager } from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

interface Props {
  icon: LucideIcon;
  size?: number;
  color?: keyof Palette | (string & {});
  strokeWidth?: number;
}

/** One visual style for every icon (Lucide, 1.75 stroke). */
export function Icon({ icon: Glyph, size = 22, color = 'text', strokeWidth = 1.75 }: Props) {
  const { palette } = useTheme();
  const resolved = (palette as unknown as Record<string, string>)[color] ?? color;
  return <Glyph size={size} color={resolved} strokeWidth={strokeWidth} />;
}

/** Arrow that points "back" in the current reading direction. */
export const BackArrow: LucideIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft;
/** Chevron that points "forward / into" in the current reading direction. */
export const ForwardChevron: LucideIcon = I18nManager.isRTL ? ChevronLeft : ChevronRight;
