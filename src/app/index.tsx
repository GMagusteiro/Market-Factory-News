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
import { getAsset, useDataset } from '@/data';
import { space, typography } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';
import { useI18n } from '@/i18n';
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
  const { t } = useI18n();
  const { assets, calendarEvents, now } = useDataset();

  const goToAsset = (slug: string) =>
    router.push({ pathname: '/ativo/[slug]', params: { slug } });

  const highlights = topStories(now);

  const upcoming = calendarEvents
    .filter((event) => {
      const time = Date.parse(event.datetime);
      return time >= now.getTime() && time <= now.getTime() + WEEK;
    })
    .slice(0, 5);

  return (
    <Screen>
      <View style={{ gap: space.md }}>
        <AppText variant="title" accessibilityRole="header">
          {t('home.title')}
        </AppText>
        <AppText tone="muted">
          {t('home.intro')}
        </AppText>
      </View>

      <AssetPicker onSelect={(asset) => goToAsset(asset.slug)} />

      <Section
        title={t('home.highlights.title')}
        subtitle={t('home.highlights.subtitle')}>
        <StoryList
          stories={highlights}
          onOpenAsset={goToAsset}
          emptyText={t('home.highlights.empty')}
        />
      </Section>

      <Section title={t('home.popular.title')} subtitle={t('home.popular.subtitle', { n: assets.length })}>
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
        title={t('home.events.title')}
        subtitle={t('home.events.subtitle')}
        action={
          <Link href="/calendario" style={[typography.small, { color: colors.primary, fontWeight: '600' }]}>
            {t('home.events.link')}
          </Link>
        }>
        <EventList events={upcoming} emptyText={t('home.events.empty')} />
      </Section>
    </Screen>
  );
}
