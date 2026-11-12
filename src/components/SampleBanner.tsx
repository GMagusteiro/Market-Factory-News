import { View } from 'react-native';

import { useDataset } from '@/data';
import { space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';

import { AppText } from './ui/AppText';

/** Aviso permanente: nesta fase todo o conteúdo é fictício. */
export function SampleBanner() {
  const { colors } = useTheme();
  const { sample } = useDataset();
  if (!sample) return null;

  return (
    <View style={{ backgroundColor: colors.banner, paddingVertical: space.sm, paddingHorizontal: space.lg }}>
      <AppText variant="small" style={{ color: colors.bannerText, textAlign: 'center' }}>
        Dados de exemplo: as notícias, fontes e eventos são fictícios e servem só para testar a app.
      </AppText>
    </View>
  );
}
