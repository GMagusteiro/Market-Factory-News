import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useI18n } from '@/i18n';
import { space } from '@/design/tokens';
import { useOnboarding } from '@/state/onboarding';

import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

/** Convite para escolher ativos. Só aparece a quem ainda não fez nem dispensou o onboarding. */
export function OnboardingCard() {
  const { t } = useI18n();
  const router = useRouter();
  const { status, mark } = useOnboarding();
  if (status !== 'new') return null;

  return (
    <Card>
      <View style={{ gap: space.md }}>
        <AppText variant="heading">{t('onboarding.card.title')}</AppText>
        <AppText tone="muted">{t('onboarding.card.text')}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          <Button label={t('onboarding.card.start')} onPress={() => router.push('/bem-vindo')} />
          <Button label={t('onboarding.card.skip')} variant="secondary" onPress={() => mark('skipped')} />
        </View>
      </View>
    </Card>
  );
}
