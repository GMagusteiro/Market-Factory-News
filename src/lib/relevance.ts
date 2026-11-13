import { getAsset, getDataset, getSource, getTheme } from '@/data';

import type { Article, Asset, Relation, Story, Theme } from './types';

/**
 * Relevância de uma história, de 0 a 100. Pesos (ver docs/PRD.md, F5):
 * recência 35%, fontes que confirmam 30%, fiabilidade 20%, alcance 15%.
 */
const WEIGHTS = { recency: 0.35, confirmation: 0.3, reliability: 0.2, reach: 0.15 } as const;

const HALF_LIFE_HOURS = 24;
const MAX_CONFIRMING_SOURCES = 5;
const MAX_REACH_ASSETS = 6;
const HOUR = 60 * 60 * 1000;

export interface ScoreInputs {
  /** Idade da notícia mais recente, em horas. */
  ageHours: number;
  /** Nº de fontes diferentes. */
  sourceCount: number;
  /** Melhor nível de fiabilidade entre as fontes (1 = mais fiável, 3 = menos). */
  bestTier: 1 | 2 | 3;
  /** Nº de ativos potencialmente relacionados. */
  affectedCount: number;
}

export function scoreStory(input: ScoreInputs): number {
  const recency = 0.5 ** (Math.max(0, input.ageHours) / HALF_LIFE_HOURS);
  const confirmation = Math.min(input.sourceCount, MAX_CONFIRMING_SOURCES) / MAX_CONFIRMING_SOURCES;
  const reliability = (4 - input.bestTier) / 3;
  const reach = Math.min(input.affectedCount, MAX_REACH_ASSETS) / MAX_REACH_ASSETS;

  const score =
    WEIGHTS.recency * recency +
    WEIGHTS.confirmation * confirmation +
    WEIGHTS.reliability * reliability +
    WEIGHTS.reach * reach;

  return Math.round(score * 100);
}

/** Ativos potencialmente afetados: menções diretas e ativos dos temas da história. */
export function affectedAssets(
  directSlugs: string[],
  themeList: Theme[],
): { asset: Asset; relation: Relation }[] {
  const result: { asset: Asset; relation: Relation }[] = [];
  const seen = new Set<string>();

  for (const slug of directSlugs) {
    const asset = getAsset(slug);
    if (asset && !seen.has(slug)) {
      seen.add(slug);
      result.push({ asset, relation: 'direct' });
    }
  }

  const themeSlugs = new Set(themeList.map((theme) => theme.slug));
  for (const asset of getDataset().assets) {
    if (!seen.has(asset.slug) && asset.themes.some((slug) => themeSlugs.has(slug))) {
      seen.add(asset.slug);
      result.push({ asset, relation: 'theme' });
    }
  }

  return result;
}

/** Agrupa artigos por história e pontua cada uma. Mais relevantes primeiro. */
export function buildStories(now: Date, pool: Article[] = getDataset().articles): Story[] {
  const groups = new Map<string, Article[]>();
  for (const article of pool) {
    const list = groups.get(article.storyId) ?? [];
    list.push(article);
    groups.set(article.storyId, list);
  }

  const stories: Story[] = [];
  for (const [id, group] of groups) {
    const tierOf = (article: Article) => getSource(article.sourceId)?.tier ?? 3;
    const byReliability = group
      .slice()
      .sort((a, b) => tierOf(a) - tierOf(b) || Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
    const leadArticle = byReliability[0];
    const sourceCount = new Set(group.map((article) => article.sourceId)).size;
    const themeSlugs = [...new Set(group.flatMap((article) => article.themes))];
    const themeList = themeSlugs.map(getTheme).filter((theme): theme is Theme => !!theme);
    const directSlugs = [...new Set(group.flatMap((article) => article.assetSlugs))];
    const affected = affectedAssets(directSlugs, themeList);
    const newest = Math.max(...group.map((article) => Date.parse(article.publishedAt)));

    stories.push({
      id,
      title: leadArticle.title,
      leadArticle,
      articles: byReliability,
      sourceCount,
      themes: themeList,
      affected,
      score: scoreStory({
        ageHours: (now.getTime() - newest) / HOUR,
        sourceCount,
        bestTier: tierOf(leadArticle) as 1 | 2 | 3,
        affectedCount: affected.length,
      }),
      updatedAt: new Date(newest).toISOString(),
    });
  }

  return stories.sort((a, b) => b.score - a.score || Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export interface HighlightOptions {
  /** Só histórias atualizadas nas últimas N horas. */
  withinHours?: number;
  /** Nº mínimo de fontes diferentes (evita destacar notícias de uma só fonte). */
  minSources?: number;
  limit?: number;
  /** Completa com histórias de uma só fonte (ex.: comunicados oficiais) quando há poucas confirmadas. */
  includeSingleSource?: boolean;
}

/** "Em destaque": as histórias mais relevantes e confirmadas por várias fontes. */
export function topStories(now: Date, options: HighlightOptions = {}): Story[] {
  const { withinHours = 24, minSources = 2, limit = 5, includeSingleSource = false } = options;
  const earliest = now.getTime() - withinHours * HOUR;

  const recent = buildStories(now).filter((story) => Date.parse(story.updatedAt) >= earliest);
  const confirmed = recent.filter((story) => story.sourceCount >= minSources);
  if (!includeSingleSource) return confirmed.slice(0, limit);
  // confirmadas primeiro; o resto por relevância (a pontuação já favorece recência e fontes oficiais)
  const rest = recent.filter((story) => story.sourceCount < minSources);
  return [...confirmed, ...rest].slice(0, limit);
}
