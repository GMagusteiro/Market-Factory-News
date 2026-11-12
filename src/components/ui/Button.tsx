import { Pressable } from 'react-native';

import { layout, radius, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';

import { AppText } from './AppText';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  accessibilityLabel?: string;
}

export function Button({ label, onPress, variant = 'primary', accessibilityLabel }: ButtonProps) {
  const { colors } = useTheme();
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: layout.controlHeight,
        paddingHorizontal: space.lg,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: primary ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: primary ? colors.primary : colors.border,
        opacity: pressed ? 0.8 : 1,
      })}>
      <AppText variant="subheading" tone={primary ? 'inverse' : 'default'}>
        {label}
      </AppText>
    </Pressable>
  );
}
