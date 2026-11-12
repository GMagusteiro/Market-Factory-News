import { Linking, Pressable, View } from 'react-native';

import { getSource } from '@/data';
import { space } from '@/design/tokens';
import { useI18n, useThemeName } from '@/i18n';
import { formatDateTime } from '@/lib/format';
import type { Story } from '@/lib/types';

import { AppText } from './ui/AppText';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';

const MAX_ASSET_CHIPS = 8;

interface StoryListProps {
  stories: Story[];
  onOpenAsset: (slug: string) => void;
  emptyText: string;
}

/** Histórias em destaque: o que mais importa, confirmado por várias fontes. */
export function StoryList({ stories, onOpenAsset, emptyText }: StoryListProps) {
  const { t, locale } = useI18n();
  const themeName = useThemeName();
  if (stories.length === 0) {
    return (
      <Card>
        <AppText tone="muted">{emptyText}</AppText>
      </Card>
    );
  }

  return (
    <View style={{ gap: space.md }}>
      {stories.map((story) => {
        const sourceNames = [...new Set(story.articles.map((article) => article.sourceId))]
          .map((id) => getSource(id)?.name)
          .filter((name): name is string => !!name);
        const shown = story.affected.slice(0, MAX_ASSET_CHIPS);
        const hidden = story.affected.length - shown.length;

        return (
          <Card key={story.id} accessibilityLabel={t('story.aria', { title: story.title })}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              <Badge label={t('story.relevance', { n: story.score })} tone="primary" />
              {story.themes.map((theme) => (
                <Badge key={theme.slug} label={themeName(theme)} />
              ))}
            </View>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel={t('news.open', { title: story.title })}
              onPress={() => Linking.openURL(story.leadArticle.url)}>
              <AppText variant="subheading">{story.title}</AppText>
            </Pressable>

            <AppText variant="small" tone="muted">
              {t('story.sources', { n: story.sourceCount, date: formatDateTime(story.updatedAt, locale) })}
            </AppText>
            <AppText variant="small" tone="muted">
              {t('story.sourceList', { names: sourceNames.join(', ') })}
            </AppText>

            {shown.length > 0 ? (
              <View style={{ gap: space.sm, marginTop: space.xs }}>
                <AppText variant="label" tone="muted">
                  {t('story.related')}
                </AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                  {shown.map(({ asset }) => (
                    <Chip
                      key={asset.slug}
                      label={asset.symbol}
                      onPress={() => onOpenAsset(asset.slug)}
                    />
                  ))}
                  {hidden > 0 ? <Badge label={`+${hidden}`} /> : null}
                </View>
              </View>
            ) : null}
          </Card>
        );
      })}
      <AppText variant="small" tone="muted">
        {t('story.disclaimer')}
      </AppText>
    </View>
  );
}
