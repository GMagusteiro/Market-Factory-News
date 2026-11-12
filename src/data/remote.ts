import type { SupabaseClient } from '@supabase/supabase-js';

import type { Article, Asset, CalendarEvent, Source, Theme } from '@/lib/types';

import { SAMPLE_NOW, setDataset, type Dataset } from './index';
import { getSupabase } from '@/lib/supabase';

/** Linhas tal como vêm do Supabase (nomes das colunas em snake_case). */
export interface RemoteRows {
  sources: { id: string; name: string; type: Source['type']; tier: Source['tier']; is_sample?: boolean }[];
  themes: { id: string; name: string; description: string | null }[];
  assets: { slug: string; symbol: string; name: string; kind: Asset['kind']; currencies: string[]; aliases: string[] }[];
  asset_themes: { asset_slug: string; theme_id: string }[];
  articles: {
    id: string;
    story_id: string | null;
    source_id: string;
    type: Article['type'];
    title: string;
    url: string;
    published_at: string;
    is_sample?: boolean;
  }[];
  article_assets: { article_id: string; asset_slug: string }[];
  article_themes: { article_id: string; theme_id: string }[];
  calendar_events: {
    id: string;
    title: string;
    country: string | null;
    currency: string | null;
    impact: CalendarEvent['impact'];
    starts_at: string;
    is_sample?: boolean;
  }[];
}

function groupBy<T>(rows: T[], key: (row: T) => string, value: (row: T) => string) {
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const k = key(row);
    map.set(k, [...(map.get(k) ?? []), value(row)]);
  }
  return map;
}

/** Converte as linhas do Supabase no formato usado pela app. */
export function mapRows(rows: RemoteRows, realNow: Date = new Date()): Dataset {
  const themesByAsset = groupBy(rows.asset_themes, (r) => r.asset_slug, (r) => r.theme_id);
  const assetsByArticle = groupBy(rows.article_assets, (r) => r.article_id, (r) => r.asset_slug);
  const themesByArticle = groupBy(rows.article_themes, (r) => r.article_id, (r) => r.theme_id);

  const assets: Asset[] = rows.assets.map((a) => ({
    slug: a.slug,
    symbol: a.symbol,
    name: a.name,
    kind: a.kind,
    currencies: a.currencies ?? [],
    aliases: a.aliases ?? [],
    themes: themesByAsset.get(a.slug) ?? [],
  }));

  const sources: Source[] = rows.sources.map((s) => ({ id: s.id, name: s.name, type: s.type, tier: s.tier }));

  const themes: Theme[] = rows.themes.map((t) => ({ slug: t.id, name: t.name, description: t.description ?? '' }));

  const articles: Article[] = rows.articles.map((a) => ({
    id: a.id,
    assetSlugs: assetsByArticle.get(a.id) ?? [],
    themes: themesByArticle.get(a.id) ?? [],
    storyId: a.story_id ?? a.id,
    title: a.title,
    sourceId: a.source_id,
    type: a.type,
    publishedAt: a.published_at,
    url: a.url,
  }));

  const calendarEvents: CalendarEvent[] = rows.calendar_events
    .map((e) => ({
      id: e.id,
      title: e.title,
      datetime: e.starts_at,
      currency: e.currency ?? '',
      country: e.country ?? '',
      impact: e.impact,
    }))
    .sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));

  const sample =
    rows.articles.some((a) => a.is_sample) ||
    rows.calendar_events.some((e) => e.is_sample) ||
    rows.sources.some((s) => s.is_sample);

  return { assets, sources, themes, articles, calendarEvents, now: sample ? SAMPLE_NOW : realNow, sample };
}

const TABLES = [
  'sources',
  'themes',
  'assets',
  'asset_themes',
  'articles',
  'article_assets',
  'article_themes',
  'calendar_events',
] as const;

/** Lê todas as tabelas de conteúdo (leitura pública, protegida por RLS). */
export async function fetchRows(client: SupabaseClient): Promise<RemoteRows> {
  const results = await Promise.all(TABLES.map((table) => client.from(table).select('*').limit(5000)));
  const rows: Record<string, unknown[]> = {};
  results.forEach((result, index) => {
    if (result.error) throw new Error(`${TABLES[index]}: ${result.error.message}`);
    rows[TABLES[index]] = result.data ?? [];
  });
  return rows as unknown as RemoteRows;
}

/**
 * Se o Supabase estiver configurado, carrega os dados de lá e substitui os de
 * exemplo. Em qualquer falha (ou base de dados vazia) a app continua com os dados locais.
 */
export async function syncFromSupabase(): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const rows = await fetchRows(client);
    if (rows.assets.length === 0) return false;
    setDataset(mapRows(rows));
    return true;
  } catch (error) {
    console.warn('Supabase indisponível, a usar dados locais.', error);
    return false;
  }
}
