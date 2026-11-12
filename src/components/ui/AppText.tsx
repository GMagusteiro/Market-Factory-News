import { Text, type TextProps } from 'react-native';

import { typography, type TypographyVariant } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';

type Tone = 'default' | 'muted' | 'primary' | 'inverse';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  tone?: Tone;
}

export function AppText({ variant = 'body', tone = 'default', style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  const color = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    inverse: colors.textInverse,
  }[tone];

  return <Text {...rest} style={[typography[variant], { color }, style]} />;
}
