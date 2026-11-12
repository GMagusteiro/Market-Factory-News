import { useRouter } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { View } from 'react-native';

import { NewsList } from '@/components/NewsList';
import { PeriodFilter } from '@/components/PeriodFilter';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { articles, getAsset } from '@/data';
import { space } from '@/design/tokens';
import { inRange } from '@/lib/period';
import type { Asset } from '@/lib/types';
import { usePeriod } from '@/lib/usePeriod';
import { useWatchlist } from '@/state/watchlist';

export function generateMetadata(): Metadata {
  return { title: 'A minha watchlist | MarketLens', robots: 'noindex' };
}

export default function WatchlistScreen() {
  const router = useRouter();
  const period = usePeriod('7d');
  const { slugs, ready, toggle } = useWatchlist();

  const followed = slugs.map(getAsset).filter((asset): asset is Asset => !!asset);
  const { range } = period;
  const feed = range
    ? articles
        .filter((article) => slugs.includes(article.assetSlug) && inRange(article.publishedAt, range))
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    : [];

  const goToAsset = (slug: string) => router.push({ pathname: '/ativo/[slug]', params: { slug } });

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        A minha watchlist
      </AppText>

      {!ready ? null : followed.length === 0 ? (
        <Card>
          <AppText variant="subheading">Ainda não segues nenhum ativo</AppText>
          <AppText tone="muted">
            Pesquisa um ativo e carrega em “Seguir” para ver aqui um feed só com as notícias dos
            teus ativos.
          </AppText>
          <View style={{ alignSelf: 'flex-start', marginTop: space.sm }}>
            <Button label="Pesquisar um ativo" onPress={() => router.push('/')} />
          </View>
        </Card>
      ) : (
        <>
          <Section title="Ativos que segues" subtitle={`${followed.length} ativo(s)`}>
            <View style={{ gap: space.md }}>
              {followed.map((asset) => (
                <Card key={asset.slug} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <View style={{ flex: 1, gap: space.xs }}>
                    <AppText variant="subheading">{asset.name}</AppText>
                    <AppText variant="small" tone="muted">
                      {asset.symbol} · {asset.kind === 'forex' ? 'Par forex' : 'Ação'}
                    </AppText>
                  </View>
                  <Button label="Ver" variant="secondary" accessibilityLabel={`Ver ${asset.name}`} onPress={() => goToAsset(asset.slug)} />
                  <Button label="Remover" variant="secondary" accessibilityLabel={`Deixar de seguir ${asset.name}`} onPress={() => toggle(asset.slug)} />
                </Card>
              ))}
            </View>
          </Section>

          <Section title="Feed" subtitle={range ? `${feed.length} notícia(s) no período escolhido` : undefined}>
            <PeriodFilter period={period} />
            <NewsList
              articles={feed}
              showAsset
              emptyText={
                range
                  ? 'Sem notícias dos teus ativos neste período. Experimenta um período mais longo.'
                  : 'Corrige as datas para ver o feed.'
              }
            />
          </Section>
        </>
      )}
    </Screen>
  );
}
