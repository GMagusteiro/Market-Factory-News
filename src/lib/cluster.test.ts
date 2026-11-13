import assert from 'node:assert/strict';
import test from 'node:test';

import { clusterArticles, similar, titleTokens } from './cluster';
import type { Article } from './types';

let n = 0;
const art = (title: string, publishedAt: string, sourceId = 's'): Article => {
  const id = `a${++n}`;
  return { id, storyId: id, assetSlugs: [], themes: [], title, sourceId, type: 'news', publishedAt, url: `https://x/${id}` } as Article;
};

test('títulos quase iguais de fontes diferentes ficam na mesma história', () => {
  const [a, b, c] = clusterArticles([
    art('Federal Reserve issues FOMC statement on interest rates', '2026-11-12T19:00:00Z', 'fed'),
    art('Fed holds interest rates steady, FOMC statement says', '2026-11-12T19:30:00Z', 'reuters'),
    art('ECB announces new payment system', '2026-11-12T20:00:00Z', 'ecb'),
  ]);
  assert.equal(a.storyId, b.storyId);
  assert.notEqual(a.storyId, c.storyId);
});

test('o mesmo título com mais de 48 horas de distância não agrupa', () => {
  const [a, b] = clusterArticles([
    art('Federal Reserve issues FOMC statement on interest rates', '2026-11-01T19:00:00Z'),
    art('Federal Reserve issues FOMC statement on interest rates', '2026-11-12T19:00:00Z'),
  ]);
  assert.notEqual(a.storyId, b.storyId);
});

test('relatórios 8-K de empresas diferentes nunca se juntam', () => {
  const [a, b] = clusterArticles([
    art('NVIDIA: SEC 8-K filing on departure or appointment of directors or officers', '2026-11-12T19:00:00Z'),
    art('Tesla: SEC 8-K filing on departure or appointment of directors or officers', '2026-11-12T19:10:00Z'),
  ]);
  assert.notEqual(a.storyId, b.storyId);
});

test('artigos que já têm história não são mexidos', () => {
  const x = { ...art('Federal Reserve issues FOMC statement on interest rates', '2026-11-12T19:00:00Z'), storyId: 'ja-tem' };
  const y = art('Federal Reserve issues FOMC statement on interest rates', '2026-11-12T19:05:00Z');
  const [rx, ry] = clusterArticles([x, y]);
  assert.equal(rx.storyId, 'ja-tem');
  assert.equal(ry.storyId, y.id);
});

test('palavras: ignora acentos e palavras curtas', () => {
  assert.ok(titleTokens('Decisão do BCE: taxas').has('decisao'));
  assert.ok(!similar(titleTokens('a b c'), titleTokens('a b c')));
});
