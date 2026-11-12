import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { View } from 'react-native';

import { AssetPicker } from '@/components/AssetPicker';
import { EventList } from '@/components/EventList';
import { NewsList } from '@/components/NewsList';
import { PeriodFilter } from '@/components/PeriodFilter';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { assets, calendarEvents, getAsset, SAMPLE_NOW } from '@/data';
import { space } from '@/design/tokens';
import { newsForAsset } from '@/lib/news';
import { inRange } from '@/lib/period';
import { usePeriod } from '@/lib/usePeriod';
import { useWatchlist } from '@/state/watchlist';

const WEEK = 7 * 24 * 60 * 60 * 1000;

/** Gera uma página HTML estática por ativo (bom para SEO). */
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return assets.map((asset) => ({ slug: asset.slug }));
}

/** Título e descrição próprios de cada ativo, escritos no HTML estático. */
export const generateMetadata: GenerateMetadataFunction = (_request, params) => {
  const asset = getAsset(String(params.slug ?? ''));
  if (!asset) return { title: 'Ativo não encontrado | MarketLens' };
  return {
    title: `${asset.name} (${asset.symbol}): notícias e eventos macro | MarketLens`,
    description: `Notícias sobre ${asset.name} (${asset.symbol}) por período, com fonte e tipo de artigo, e os eventos macro que afetam ${asset.currencies.join(' e ')}.`,
  };
};

export default function AssetScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const period = usePeriod('7d');
  const watchlist = useWatchlist();
  const asset = getAsset(slug ?? '');

  if (!asset) {
    return (
      <Screen>
        <AppText variant="title">Ativo não encontrado</AppText>
        <Link href="/">
          <AppText tone="primary">Voltar à pesquisa</AppText>
        </Link>
      </Screen>
    );
  }

  const { range } = period;
  const following = watchlist.has(asset.slug);

  // Menções diretas e notícias ligadas ao ativo pelos seus temas.
  const assetNews = newsForAsset(asset, range);

  // Eventos das moedas do ativo, no período escolhido e nos próximos 7 dias.
  const upcomingLimit = SAMPLE_NOW.getTime() + WEEK;
  const relatedEvents = calendarEvents.filter((event) => {
    if (!asset.currencies.includes(event.currency)) return false;
    const time = Date.parse(event.datetime);
    const inPeriod = range ? inRange(event.datetime, range) : false;
    const upcoming = time > SAMPLE_NOW.getTime() && time <= upcomingLimit;
    return inPeriod || upcoming;
  });

  return (
    <Screen>
      <AssetPicker onSelect={(next) => router.replace({ pathname: '/ativo/[slug]', params: { slug: next.slug } })} />

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.md,
        }}>
        <View style={{ flexShrink: 1, gap: space.xs }}>
          <AppText variant="title" accessibilityRole="header">
            {asset.name}
          </AppText>
          <AppText tone="muted">
            {asset.symbol} · {asset.kind === 'forex' ? 'Par forex' : 'Ação'}
          </AppText>
        </View>
        <Button
          label={following ? 'A seguir' : 'Seguir'}
          variant={following ? 'secondary' : 'primary'}
          accessibilityLabel={following ? `Deixar de seguir ${asset.name}` : `Seguir ${asset.name}`}
          onPress={() => watchlist.toggle(asset.slug)}
        />
      </View>

      <Section title="Notícias" subtitle={range ? `${assetNews.length} no período escolhido` : undefined}>
        <PeriodFilter period={period} />
        <NewsList
          entries={assetNews}
          emptyText={
            range
              ? 'Sem notícias para este ativo no período escolhido. Experimenta um período mais longo.'
              : 'Corrige as datas para ver as notícias.'
          }
        />
      </Section>

      <Section
        title="Eventos macro relacionados"
        subtitle={`Eventos que afetam ${asset.currencies.join(' e ')}, no período e nos próximos 7 dias`}>
        <EventList events={relatedEvents} emptyText="Sem eventos relacionados neste período." />
      </Section>
    </Screen>
  );
}
