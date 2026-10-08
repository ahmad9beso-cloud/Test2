import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

interface Props {
  size: number;
  /** Continuous device heading in degrees (clockwise from north). */
  heading: number;
  /** Bearing to the Kaaba in degrees (clockwise from north). */
  qibla: number;
  /** Show cardinal letters and degree ticks (large compass). */
  detailed?: boolean;
}

interface DialProps {
  qibla: number;
  detailed: boolean;
  ring: string;
  tick: string;
  text: string;
  accent: string;
  gold: string;
  north: string;
  fill: string;
}

/** Everything that rotates with the world. Memoised so heading updates only change a transform. */
const Dial = memo(function Dial({ qibla, detailed, ring, tick, text, accent, gold, north, fill }: DialProps) {
  const ticks: React.ReactNode[] = [];
  for (let deg = 0; deg < 360; deg += detailed ? 5 : 30) {
    const major = deg % 30 === 0;
    const len = major ? 9 : 4.5;
    ticks.push(
      <Line
        key={deg}
        x1="100"
        y1="8"
        x2="100"
        y2={8 + len}
        stroke={tick}
        strokeWidth={major ? 1.6 : 0.9}
        transform={`rotate(${deg} 100 100)`}
      />,
    );
  }

  const cardinal = (label: string, deg: number, color: string) => (
    <G key={label} transform={`rotate(${deg} 100 100)`}>
      <SvgText x="100" y="40" fontSize="15" fontFamily={fonts.bold} fill={color} textAnchor="middle">
        {label}
      </SvgText>
    </G>
  );

  return (
    <Svg width="100%" height="100%" viewBox="0 0 200 200">
      <Circle cx="100" cy="100" r="96" fill={fill} stroke={ring} strokeWidth="1.5" />
      <Circle cx="100" cy="100" r="62" fill="none" stroke={ring} strokeWidth="0.8" opacity={0.7} />
      {ticks}
      {detailed ? (
        <>
          {cardinal('ش', 0, north)}
          {cardinal('ق', 90, text)}
          {cardinal('ج', 180, text)}
          {cardinal('غ', 270, text)}
        </>
      ) : null}
      {/* North marker (triangle + letter, so it never relies on colour only) */}
      <Polygon points="100,2 94,14 106,14" fill={north} />

      {/* Qibla: arrow from centre to the rim + Kaaba marker, rotated to its bearing */}
      <G transform={`rotate(${qibla} 100 100)`}>
        <Line x1="100" y1="100" x2="100" y2="34" stroke={accent} strokeWidth="3.2" strokeLinecap="round" />
        <Path d="M100 18 L89 40 L100 34 L111 40 Z" fill={accent} />
        <Rect x="90" y="-2" width="20" height="20" rx="3" fill={gold} transform="translate(0 0)" />
        <Rect x="94" y="2" width="12" height="12" rx="1.5" fill="none" stroke={fill} strokeWidth="1.4" />
      </G>
      <Circle cx="100" cy="100" r="5" fill={accent} />
      <Circle cx="100" cy="100" r="2" fill={fill} />
    </Svg>
  );
});

/**
 * Smooth compass. The dial rotates by -heading so north stays north; the Qibla arrow is drawn at its
 * bearing inside the dial, so when the phone points at the Qibla the arrow points straight up
 * towards the fixed pointer at the top.
 */
export function CompassDial({ size, heading, qibla, detailed = true }: Props) {
  const { palette } = useTheme();
  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel="بوصلة القبلة">
      <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${-heading}deg` }] }]}>
        <Dial
          qibla={qibla}
          detailed={detailed}
          ring={palette.border}
          tick={palette.textMuted}
          text={palette.text}
          accent={palette.primary}
          gold={palette.gold}
          north={palette.danger}
          fill={palette.surface}
        />
      </View>
      {/* Fixed pointer: the direction the top of the phone faces */}
      <View pointerEvents="none" style={[styles.pointerWrap]}>
        <Svg width={18} height={14} viewBox="0 0 18 14">
          <Polygon points="9,14 0,0 18,0" fill={palette.text} />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pointerWrap: { position: 'absolute', top: -14, left: 0, right: 0, alignItems: 'center' },
});
