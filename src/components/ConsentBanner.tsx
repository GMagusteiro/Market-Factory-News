import { Link } from 'expo-router';
import { View } from 'react-native';

import { layout, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';
import { useI18n } from '@/i18n';
import { useConsent } from '@/state/consent';

import { AppText } from './ui/AppText';
import { Button } from './ui/Button';

/** Pede consentimento para análise. Recusar tem o mesmo destaque que aceitar. */
export function ConsentBanner() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { consent, ready, accept, reject } = useConsent();

  if (!ready || consent !== 'unset') return null;

  return (
    <View
      accessibilityRole="alert"
      style={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        padding: space.md,
      }}>
      <View
        style={{
          width: '100%',
          maxWidth: layout.maxWidth,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: space.md,
        }}>
        <View style={{ flex: 1, minWidth: 240, gap: space.xs }}>
          <AppText variant="small">{t('consent.text')}</AppText>
          <Link href="/legal/cookies">
            <AppText variant="small" tone="primary">
              {t('footer.cookies')}
            </AppText>
          </Link>
        </View>
        <Button label={t('consent.reject')} variant="secondary" onPress={reject} />
        <Button label={t('consent.accept')} variant="secondary" onPress={accept} />
      </View>
    </View>
  );
}
