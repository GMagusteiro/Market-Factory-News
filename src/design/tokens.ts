import { Platform, type TextStyle } from 'react-native';

/**
 * Design system do Market Factory News: ÚNICO sítio com cores, tipografia e espaçamentos.
 * Os ecrãs e componentes nunca definem cores ou tamanhos soltos.
 */

export const palette = {
  light: {
    bg: '#F7F4EE',
    surface: '#FFFFFF',
    surfaceAlt: '#EFEAE0',
    border: '#DDD6C8',
    text: '#14201F',
    textMuted: '#5A6563',
    textInverse: '#FFFFFF',
    primary: '#0B7F86',
    primarySoft: '#DDF1F1',
    accent: '#E4572E',
    accentSoft: '#FCE6DE',
    positive: '#2F7D32',
    positiveSoft: '#E2F1E3',
    warning: '#9A5B00',
    warningSoft: '#FCEFD6',
    danger: '#B42318',
    dangerSoft: '#FDE4E1',
    banner: '#FFF4CC',
    bannerText: '#5C4400',
  },
  dark: {
    bg: '#0C1516',
    surface: '#131F21',
    surfaceAlt: '#1B2B2D',
    border: '#2A3C3E',
    text: '#EAF1F0',
    textMuted: '#9AABA9',
    textInverse: '#0C1516',
    primary: '#4FD1C5',
    primarySoft: '#143A3B',
    accent: '#FF8A63',
    accentSoft: '#3E211A',
    positive: '#7ED68A',
    positiveSoft: '#173A1C',
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
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

/** Títulos em serifa (tom editorial); o resto em sans-serif do sistema. Sem fontes a descarregar. */
export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' }) as string,
} as const;

export const typography = {
  title: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: -0.5 },
  heading: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 27, fontWeight: '700' },
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
