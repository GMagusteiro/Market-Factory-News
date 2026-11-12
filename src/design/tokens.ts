import type { TextStyle } from 'react-native';

/**
 * Design system do MarketLens: ÚNICO sítio com cores, tipografia e espaçamentos.
 * Os ecrãs e componentes nunca definem cores ou tamanhos soltos.
 */

export const palette = {
  light: {
    bg: '#F4F6F9',
    surface: '#FFFFFF',
    surfaceAlt: '#EBEFF5',
    border: '#D8DEE8',
    text: '#0E1726',
    textMuted: '#556275',
    textInverse: '#FFFFFF',
    primary: '#1747C9',
    primarySoft: '#E3EBFD',
    positive: '#0B7A5A',
    positiveSoft: '#DDF3EB',
    warning: '#9A5B00',
    warningSoft: '#FCEFD6',
    danger: '#B42318',
    dangerSoft: '#FDE4E1',
    banner: '#FFF4CC',
    bannerText: '#5C4400',
  },
  dark: {
    bg: '#0B1220',
    surface: '#131C2E',
    surfaceAlt: '#1B2740',
    border: '#27344F',
    text: '#E8EDF6',
    textMuted: '#97A3B8',
    textInverse: '#0B1220',
    primary: '#7AA2FF',
    primarySoft: '#1C2C52',
    positive: '#4ED1A1',
    positiveSoft: '#12342B',
    warning: '#F2B24C',
    warningSoft: '#3A2A0C',
    danger: '#FF8A7A',
    dangerSoft: '#3C1713',
    banner: '#3A2F0B',
    bannerText: '#F7E4A0',
  },
};

export type Colors = typeof palette.light;
export type Scheme = keyof typeof palette;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 40,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.4 },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  subheading: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.3 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export const layout = {
  maxWidth: 960,
  controlHeight: 44,
} as const;
