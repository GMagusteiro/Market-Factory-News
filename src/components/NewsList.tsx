import { Linking, Pressable, View } from 'react-native';

import { getAsset, getSource } from '@/data';
import { space } from '@/design/tokens';
import { ARTICLE_TYPE_LABEL, formatDateTime } from '@/lib/format';
import type { Article, ArticleType } from '@/lib/types';

import { AppText } from './ui/AppText';
import { Badge, type BadgeTone } from './ui/Badge';
import { Card } from './ui/Card';

const TYPE_TONE: Record<ArticleType, BadgeTone> = {
  news: 'primary',
  opinion: 'warning',
  official: 'positive',
};

function NewsItem({ article, showAsset }: { article: Article; showAsset: boolean }) {
  const source = getSource(article.sourceId);
  const asset = getAsset(article.assetSlug);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${article.title}. Abre o artigo original.`}
      onPress={() => Linking.openURL(article.url)}>
      <Card>
        <AppText variant="subheading">{article.title}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm }}>
          <Badge label={ARTICLE_TYPE_LABEL[article.type]} tone={TYPE_TONE[article.type]} />
          {showAsset && asset ? <Badge label={asset.symbol} /> : null}
          <AppText variant="small" tone="muted">
            {source?.name ?? 'Fonte desconhecida'} · {formatDateTime(article.publishedAt)}
          </AppText>
        </View>
      </Card>
    </Pressable>
  );
}

interface NewsListProps {
  /** Já filtrados e ordenados. */
  articles: Article[];
  showAsset?: boolean;
  emptyText: string;
}

export function NewsList({ articles, showAsset = false, emptyText }: NewsListProps) {
  if (articles.length === 0) {
    return (
      <Card>
        <AppText tone="muted">{emptyText}</AppText>
      </Card>
    );
  }

  return (
    <View style={{ gap: space.md }}>
      {articles.map((article) => (
        <NewsItem key={article.id} article={article} showAsset={showAsset} />
      ))}
    </View>
  );
}
