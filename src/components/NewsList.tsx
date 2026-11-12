import { Linking, Pressable, View } from 'react-native';

import { getAsset, getSource } from '@/data';
import { space } from '@/design/tokens';
import { useI18n, useThemeName } from '@/i18n';
import { formatDateTime } from '@/lib/format';
import type { ArticleType, NewsEntry } from '@/lib/types';

import { AppText } from './ui/AppText';
import { Badge, type BadgeTone } from './ui/Badge';
import { Card } from './ui/Card';

const TYPE_TONE: Record<ArticleType, BadgeTone> = {
  news: 'primary',
  opinion: 'warning',
  official: 'positive',
};

function NewsItem({ entry, showAsset }: { entry: NewsEntry; showAsset: boolean }) {
  const { article, relation, theme } = entry;
  const { t, locale } = useI18n();
  const themeName = useThemeName();
  const source = getSource(article.sourceId);
  const mentioned = showAsset
    ? article.assetSlugs.map(getAsset).filter((asset) => !!asset)
    : [];

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={t('news.open', { title: article.title })}
      onPress={() => Linking.openURL(article.url)}>
      <Card>
        <AppText variant="subheading">{article.title}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm }}>
          <Badge label={t(`news.type.${article.type}`)} tone={TYPE_TONE[article.type]} />
          {relation === 'theme' && theme ? <Badge label={t('news.theme', { name: themeName(theme) })} /> : null}
          {mentioned.map((asset) => (asset ? <Badge key={asset.slug} label={asset.symbol} /> : null))}
          <AppText variant="small" tone="muted">
            {source?.name ?? t('news.unknownSource')} · {formatDateTime(article.publishedAt, locale)}
          </AppText>
        </View>
        {relation === 'theme' ? (
          <AppText variant="small" tone="muted">
            {t('news.themeNote')}
          </AppText>
        ) : null}
      </Card>
    </Pressable>
  );
}

interface NewsListProps {
  /** Já filtradas e ordenadas. */
  entries: NewsEntry[];
  /** Mostra os ativos mencionados em cada notícia (útil na watchlist). */
  showAsset?: boolean;
  emptyText: string;
}

export function NewsList({ entries, showAsset = false, emptyText }: NewsListProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <AppText tone="muted">{emptyText}</AppText>
      </Card>
    );
  }

  return (
    <View style={{ gap: space.md }}>
      {entries.map((entry) => (
        <NewsItem key={entry.article.id} entry={entry} showAsset={showAsset} />
      ))}
    </View>
  );
}
