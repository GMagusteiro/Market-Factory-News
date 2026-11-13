import { Link } from 'expo-router';
import { View } from 'react-native';

import { fonts, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';

import { AppText } from './ui/AppText';

/** Marca: lente (anel) com um brilho coral, mais o nome Market Factory News em serifa. Desenhada com views, sem imagens. */
export function LogoMark({ size = 28 }: { size?: number }) {
  const { colors } = useTheme();
  const ring = Math.round(size * 0.56);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: Math.max(2, size * 0.1),
          borderColor: colors.textInverse,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.2,
          height: size * 0.2,
          borderRadius: size * 0.1,
          backgroundColor: colors.accent,
          right: size * 0.12,
          bottom: size * 0.12,
        }}
      />
    </View>
  );
}

export function Logo() {
  const { colors } = useTheme();
  return (
    <Link href="/" accessibilityLabel="Market Factory News" style={{ marginRight: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <LogoMark />
        <AppText style={{ fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.3 }}>
          Market{' '}
          <AppText style={{ fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, fontWeight: '700', fontStyle: 'italic', color: colors.primary }}>
            Factory
          </AppText>{' '}
          News
        </AppText>
      </View>
    </Link>
  );
}
