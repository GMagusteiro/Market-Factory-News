import { Pressable } from 'react-native';

import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';

import { AppText } from './AppText';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
        opacity: pressed ? 0.8 : 1,
      })}>
      <AppText variant="small" tone={selected ? 'primary' : 'default'} style={{ fontWeight: '600' }}>
        {label}
      </AppText>
    </Pressable>
  );
}
