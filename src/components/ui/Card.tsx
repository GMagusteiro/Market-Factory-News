import { View, type ViewProps } from 'react-native';

import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';

export function Card({ style, ...rest }: ViewProps) {
  const { colors } = useTheme();

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          padding: space.lg,
          gap: space.sm,
        },
        style,
      ]}
    />
  );
}
