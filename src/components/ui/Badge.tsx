import { View } from 'react-native';

import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';

import { AppText } from './AppText';

export type BadgeTone = 'neutral' | 'primary' | 'positive' | 'warning' | 'danger';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const { colors } = useTheme();
  const palette = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    primary: { bg: colors.primarySoft, fg: colors.primary },
    positive: { bg: colors.positiveSoft, fg: colors.positive },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  }[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
        borderRadius: radius.sm,
        backgroundColor: palette.bg,
      }}>
      <AppText variant="label" style={{ color: palette.fg }}>
        {label}
      </AppText>
    </View>
  );
}
