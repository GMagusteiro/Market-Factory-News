import { Link } from 'expo-router';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';

export default function NotFoundScreen() {
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        Página não encontrada
      </AppText>
      <Link href="/">
        <AppText tone="primary">Voltar à pesquisa</AppText>
      </Link>
    </Screen>
  );
}
