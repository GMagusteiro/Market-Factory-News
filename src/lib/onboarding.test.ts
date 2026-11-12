import test from 'node:test';
import assert from 'node:assert/strict';
import { assetsForInterest, canFinish, mergePicks } from './onboarding';
import type { Asset } from './types';

const A = (slug: string, kind: 'stock' | 'forex') => ({ slug, kind }) as unknown as Asset;
const list = [A('nvda', 'stock'), A('eur-usd', 'forex'), A('aapl', 'stock')];

test('filtra ativos por interesse', () => {
  assert.deepEqual(assetsForInterest(list, 'stock').map((a) => a.slug), ['nvda', 'aapl']);
  assert.deepEqual(assetsForInterest(list, 'forex').map((a) => a.slug), ['eur-usd']);
  assert.equal(assetsForInterest(list, 'both').length, 3);
});

test('exige pelo menos 3 ativos distintos', () => {
  assert.equal(canFinish(['a', 'b']), false);
  assert.equal(canFinish(['a', 'a', 'b']), false);
  assert.equal(canFinish(['a', 'b', 'c']), true);
});

test('mergePicks não duplica', () => {
  assert.deepEqual(mergePicks(['a', 'b'], ['b', 'c']), ['a', 'b', 'c']);
});
