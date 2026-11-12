import { Linking, Pressable, View } from 'react-native';

import { getAsset, getSource } from '@/data';
import { space } from '@/design/tokens';
import { ARTICLE_TYPE_LABEL, formatDateTime } from '@/lib/format';
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
  const source = getSource(article.sourceId);
  const mentioned = showAsset
    ? article.assetSlugs.map(getAsset).filter((asset) => !!asset)
    : [];

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${article.title}. Abre o artigo original.`}
      onPress={() => Linking.openURL(article.url)}>
      <Card>
        <AppText variant="subheading">{article.title}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm }}>
          <Badge label={ARTICLE_TYPE_LABEL[article.type]} tone={TYPE_TONE[article.type]} />
          {relation === 'theme' && theme ? <Badge label={`Tema: ${theme.name}`} /> : null}
          {mentioned.map((asset) => (asset ? <Badge key={asset.slug} label={asset.symbol} /> : null))}
          <AppText variant="small" tone="muted">
            {source?.name ?? 'Fonte desconhecida'} · {formatDateTime(article.publishedAt)}
          </AppText>
        </View>
        {relation === 'theme' ? (
          <AppText variant="small" tone="muted">
            Não menciona o ativo diretamente: está ligada a ele pelo tema.
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
