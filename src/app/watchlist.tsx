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
import { getAsset, useDataset } from '@/data';
import { space } from '@/design/tokens';
import { useI18n } from '@/i18n';
import { newsForAssets } from '@/lib/news';
import type { Asset } from '@/lib/types';
import { usePeriod } from '@/lib/usePeriod';
import { useWatchlist } from '@/state/watchlist';

export function generateMetadata(): Metadata {
  return { title: 'My watchlist | MarketLens', robots: 'noindex' };
}

export default function WatchlistScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const period = usePeriod('7d');
  const { slugs, ready, toggle } = useWatchlist();
  useDataset(); // volta a desenhar quando os dados do Supabase chegam

  const followed = slugs.map(getAsset).filter((asset): asset is Asset => !!asset);
  const { range } = period;
  const feed = newsForAssets(followed, range);

  const goToAsset = (slug: string) => router.push({ pathname: '/ativo/[slug]', params: { slug } });

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('watchlist.title')}
      </AppText>

      {!ready ? null : followed.length === 0 ? (
        <Card>
          <AppText variant="subheading">{t('watchlist.empty.title')}</AppText>
          <AppText tone="muted">
            {t('watchlist.empty.body')}
          </AppText>
          <View style={{ alignSelf: 'flex-start', marginTop: space.sm }}>
            <Button label={t('watchlist.empty.button')} onPress={() => router.push('/')} />
          </View>
        </Card>
      ) : (
        <>
          <Section title={t('watchlist.followed.title')} subtitle={t('watchlist.followed.subtitle', { n: followed.length })}>
            <View style={{ gap: space.md }}>
              {followed.map((asset) => (
                <Card key={asset.slug} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <View style={{ flex: 1, gap: space.xs }}>
                    <AppText variant="subheading">{asset.name}</AppText>
                    <AppText variant="small" tone="muted">
                      {asset.symbol} · {t(asset.kind === 'forex' ? 'asset.kind.forexLong' : 'asset.kind.stock')}
                    </AppText>
                  </View>
                  <Button label={t('watchlist.view')} variant="secondary" accessibilityLabel={t('watchlist.viewLabel', { name: asset.name })} onPress={() => goToAsset(asset.slug)} />
                  <Button label={t('watchlist.remove')} variant="secondary" accessibilityLabel={t('asset.unfollowLabel', { name: asset.name })} onPress={() => toggle(asset.slug)} />
                </Card>
              ))}
            </View>
          </Section>

          <Section title={t('watchlist.feed.title')} subtitle={range ? t('watchlist.feed.count', { n: feed.length }) : undefined}>
            <PeriodFilter period={period} />
            <NewsList
              entries={feed}
              showAsset
              emptyText={
                range
                  ? t('watchlist.feed.empty')
                  : t('watchlist.feed.fixDates')
              }
            />
          </Section>
        </>
      )}
    </Screen>
  );
}
