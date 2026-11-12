import { Link } from 'expo-router';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useI18n } from '@/i18n';

export default function NotFoundScreen() {
  const { t } = useI18n();
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('notFound.title')}
      </AppText>
      <Link href="/">
        <AppText tone="primary">{t('asset.back')}</AppText>
      </Link>
    </Screen>
  );
}
