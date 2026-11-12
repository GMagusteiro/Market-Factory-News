import assert from 'node:assert/strict';
import { test } from 'node:test';

import { articles, assets, SAMPLE_NOW } from '../data';
import { inRange, resolveRange } from './period';
import { searchAssets } from './search';

test('pesquisa por nome, símbolo e alias', () => {
  assert.equal(searchAssets('nvidia')[0]?.slug, 'nvda');
  assert.equal(searchAssets('NVDA')[0]?.slug, 'nvda');
  assert.equal(searchAssets('jensen')[0]?.slug, 'nvda');
});

test('pesquisa ignora acentos e barras em pares forex', () => {
  assert.equal(searchAssets('jeronimo')[0]?.slug, 'jmt');
  assert.equal(searchAssets('eurusd')[0]?.slug, 'eur-usd');
  assert.equal(searchAssets('eur/usd')[0]?.slug, 'eur-usd');
});

test('pesquisa vazia ou sem correspondência não devolve nada', () => {
  assert.deepEqual(searchAssets(''), []);
  assert.deepEqual(searchAssets('zzzzzz'), []);
});

test('slugs dos ativos são únicos', () => {
  assert.equal(new Set(assets.map((a) => a.slug)).size, assets.length);
});

test('períodos mais longos devolvem mais notícias', () => {
  const count = (key: '24h' | '7d' | '30d') => {
    const range = resolveRange(key, '', '', SAMPLE_NOW);
    assert.ok(range);
    return articles.filter((a) => a.assetSlugs.includes('nvda') && inRange(a.publishedAt, range))
      .length;
  };
  assert.ok(count('24h') <= count('7d'));
  assert.ok(count('7d') < count('30d'));
  assert.ok(count('24h') >= 1);
});
