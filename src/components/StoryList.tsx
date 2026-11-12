import { Linking, Pressable, View } from 'react-native';

import { getSource } from '@/data';
import { space } from '@/design/tokens';
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
          <Card key={story.id} accessibilityLabel={`História: ${story.title}`}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              <Badge label={`Relevância ${story.score}/100`} tone="primary" />
              {story.themes.map((theme) => (
                <Badge key={theme.slug} label={theme.name} />
              ))}
            </View>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`${story.title}. Abre o artigo original.`}
              onPress={() => Linking.openURL(story.leadArticle.url)}>
              <AppText variant="subheading">{story.title}</AppText>
            </Pressable>

            <AppText variant="small" tone="muted">
              {story.sourceCount} fontes · atualizada {formatDateTime(story.updatedAt)}
            </AppText>
            <AppText variant="small" tone="muted">
              Fontes: {sourceNames.join(', ')}
            </AppText>

            {shown.length > 0 ? (
              <View style={{ gap: space.sm, marginTop: space.xs }}>
                <AppText variant="label" tone="muted">
                  ATIVOS POTENCIALMENTE RELACIONADOS
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
        As ligações por tema são automáticas e meramente informativas. Não são recomendações de
        investimento nem indicam que o preço vá subir ou descer.
      </AppText>
    </View>
  );
}
