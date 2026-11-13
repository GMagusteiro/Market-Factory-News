import assert from 'node:assert/strict';
import test from 'node:test';

import { articles, assets, calendarEvents, getAsset, localDataset, setDataset, sources, themes } from './index';
import { fetchTable, mapRows, syncFromSupabase, type RemoteRows } from './remote';

/** Converte os dados locais em linhas "como se viessem do Supabase". */
function toRows(sample: boolean): RemoteRows {
  return {
    sources: sources.map((s) => ({ ...s, is_sample: sample })),
    themes: themes.map((t) => ({ id: t.slug, name: t.name, description: t.description })),
    assets: assets.map(({ themes: _themes, ...a }) => a),
    asset_themes: assets.flatMap((a) => a.themes.map((t) => ({ asset_slug: a.slug, theme_id: t }))),
    articles: articles.map((a) => ({
      id: a.id,
      story_id: a.storyId,
      source_id: a.sourceId,
      type: a.type,
      title: a.title,
      url: a.url,
      published_at: a.publishedAt,
      is_sample: sample,
    })),
    article_assets: articles.flatMap((a) => a.assetSlugs.map((s) => ({ article_id: a.id, asset_slug: s }))),
    article_themes: articles.flatMap((a) => a.themes.map((t) => ({ article_id: a.id, theme_id: t }))),
    calendar_events: calendarEvents.map((e) => ({
      id: e.id,
      title: e.title,
      country: e.country,
      currency: e.currency,
      impact: e.impact,
      starts_at: e.datetime,
      is_sample: sample,
    })),
  };
}

test('mapRows reconstrói exatamente os dados locais (ida e volta)', () => {
  const mapped = mapRows(toRows(true));
  assert.deepEqual(mapped.assets, assets);
  assert.deepEqual(mapped.sources, sources);
  assert.deepEqual(mapped.themes, themes);
  assert.deepEqual(mapped.articles, articles);
  assert.deepEqual(mapped.calendarEvents, calendarEvents);
});

test('dados de exemplo mantêm o "agora" fixo; dados reais usam a hora real', () => {
  const real = new Date('2027-01-05T09:00:00Z');
  assert.equal(mapRows(toRows(true), real).now.toISOString(), localDataset.now.toISOString());
  assert.equal(mapRows(toRows(true), real).sample, true);
  const noSample = mapRows(toRows(false), real);
  assert.equal(noSample.now.toISOString(), real.toISOString());
  assert.equal(noSample.sample, false);
});

test('artigo sem história usa o próprio id como storyId', () => {
  const rows = toRows(false);
  rows.articles[0].story_id = null;
  assert.equal(mapRows(rows).articles[0].storyId, rows.articles[0].id);
});

test('setDataset troca os dados lidos por getAsset; sem configuração mantém os locais', async () => {
  assert.equal(await syncFromSupabase(), false); // sem EXPO_PUBLIC_SUPABASE_*
  assert.ok(getAsset('nvda'));
  setDataset({ ...localDataset, assets: assets.filter((a) => a.slug !== 'nvda') });
  assert.equal(getAsset('nvda'), undefined);
  setDataset(localDataset);
  assert.ok(getAsset('nvda'));
});

test('fetchTable lê por páginas de 1000 até acabar', async () => {
  const total = 2300;
  const calls: [number, number][] = [];
  const client = {
    from: () => ({
      select: () => ({
        range: async (from: number, to: number) => {
          calls.push([from, to]);
          const n = Math.max(0, Math.min(to, total - 1) - from + 1);
          return { data: Array.from({ length: n }, (_, i) => ({ i: from + i })), error: null };
        },
      }),
    }),
  };
  const rows = await fetchTable(client as never, 'articles');
  assert.equal(rows.length, total);
  assert.deepEqual(calls, [[0, 999], [1000, 1999], [2000, 2999]]);
});
