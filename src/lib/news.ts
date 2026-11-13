import { getDataset, getTheme } from '@/data';

import { inRange, type DateRange } from './period';
import type { Asset, NewsEntry } from './types';

/**
 * Notícias relevantes para um conjunto de ativos num período.
 * - "direct": a notícia menciona o ativo.
 * - "theme": a notícia é sobre um tema a que o ativo pertence (ex.: terras raras),
 *   mesmo sem o nomear. A menção direta tem prioridade.
 * Mais recentes primeiro. Sem período válido devolve lista vazia.
 */
export function newsForAssets(list: Asset[], range: DateRange | null): NewsEntry[] {
  if (!range) return [];

  const slugs = new Set(list.map((asset) => asset.slug));
  const themeSlugs = new Set(list.flatMap((asset) => asset.themes));
  const entries: NewsEntry[] = [];

  for (const article of getDataset().articles) {
    if (!inRange(article.publishedAt, range)) continue;

    if (article.assetSlugs.some((slug) => slugs.has(slug))) {
      entries.push({ article, relation: 'direct' });
      continue;
    }

    const themeSlug = article.themes.find((slug) => themeSlugs.has(slug));
    if (themeSlug) {
      entries.push({
        article,
        relation: 'theme',
        theme: getTheme(themeSlug),
        viaAssets: list.filter((asset) => asset.themes.includes(themeSlug)),
      });
    }
  }

  return entries.sort((a, b) => Date.parse(b.article.publishedAt) - Date.parse(a.article.publishedAt));
}

export const newsForAsset = (asset: Asset, range: DateRange | null) =>
  newsForAssets([asset], range);
