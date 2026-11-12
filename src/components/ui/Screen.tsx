import { Link } from 'expo-router';
import { ScrollView, View } from 'react-native';
import type { ReactNode } from 'react';

import { layout, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';
import { useI18n } from '@/i18n';

import { AppText } from './AppText';

/** Contentor de página: centrado, com largura máxima e o aviso legal no fim. */
export function Screen({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ alignItems: 'center', padding: space.lg, paddingBottom: space.xxl }}
      keyboardShouldPersistTaps="handled">
      <View style={{ width: '100%', maxWidth: layout.maxWidth, gap: space.xl }}>
        {children}
        <AppText variant="small" tone="muted" style={{ textAlign: 'center' }}>
          {t('legal.disclaimer')}
        </AppText>
        <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: space.lg }}>
          <Link href="/legal/privacidade">
            <AppText variant="small" tone="primary">{t('footer.privacy')}</AppText>
          </Link>
          <Link href="/legal/termos">
            <AppText variant="small" tone="primary">{t('footer.terms')}</AppText>
          </Link>
          <Link href="/legal/cookies">
            <AppText variant="small" tone="primary">{t('footer.cookies')}</AppText>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
