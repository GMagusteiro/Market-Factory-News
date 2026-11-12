import { Link, useRouter } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { View } from 'react-native';

import { AssetPicker } from '@/components/AssetPicker';
import { EventList } from '@/components/EventList';
import { StoryList } from '@/components/StoryList';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { assets, calendarEvents, getAsset, SAMPLE_NOW } from '@/data';
import { space, typography } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';
import { topStories } from '@/lib/relevance';

const POPULAR_SLUGS = ['nvda', 'aapl', 'msft', 'tsla', 'eur-usd', 'usd-jpy'];
const WEEK = 7 * 24 * 60 * 60 * 1000;

export function generateMetadata(): Metadata {
  return {
    title: 'MarketLens: notícias de ações e forex por ativo e período',
    description:
      'Escolhe um ativo (ação ou par forex), define o período e vê as notícias relevantes com a fonte e o tipo de cada artigo, ao lado do calendário económico.',
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const goToAsset = (slug: string) =>
    router.push({ pathname: '/ativo/[slug]', params: { slug } });

  const highlights = topStories(SAMPLE_NOW);

  const upcoming = calendarEvents
    .filter((event) => {
      const time = Date.parse(event.datetime);
      return time >= SAMPLE_NOW.getTime() && time <= SAMPLE_NOW.getTime() + WEEK;
    })
    .slice(0, 5);

  return (
    <Screen>
      <View style={{ gap: space.md }}>
        <AppText variant="title" accessibilityRole="header">
          Notícias de ações e forex, por ativo e período
        </AppText>
        <AppText tone="muted">
          Escolhe um ativo, define o período e vê só o que importa, com a fonte e o tipo de cada
          artigo.
        </AppText>
      </View>

      <AssetPicker onSelect={(asset) => goToAsset(asset.slug)} />

      <Section
        title="Em destaque"
        subtitle="As histórias mais relevantes das últimas 24 horas, confirmadas por várias fontes">
        <StoryList
          stories={highlights}
          onOpenAsset={goToAsset}
          emptyText="Sem histórias em destaque nas últimas 24 horas."
        />
      </Section>

      <Section title="Populares" subtitle={`${assets.length} ativos disponíveis nesta fase`}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {POPULAR_SLUGS.map((slug) => {
            const asset = getAsset(slug);
            return asset ? (
              <Chip key={slug} label={asset.symbol} onPress={() => goToAsset(slug)} />
            ) : null;
          })}
        </View>
      </Section>

      <Section
        title="Próximos eventos macro"
        subtitle="Nos próximos 7 dias"
        action={
          <Link href="/calendario" style={[typography.small, { color: colors.primary, fontWeight: '600' }]}>
            Ver calendário
          </Link>
        }>
        <EventList events={upcoming} emptyText="Sem eventos nos próximos 7 dias." />
      </Section>
    </Screen>
  );
}
