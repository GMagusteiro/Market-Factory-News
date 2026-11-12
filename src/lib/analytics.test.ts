import test from 'node:test';
import assert from 'node:assert/strict';
import { createTracker, type ConsentState } from './analytics';

function setup(consent: ConsentState, key: string | undefined = 'phc_x', id: string | null = 'anon-1') {
  const calls: { url: string; body: string }[] = [];
  const track = createTracker({
    key,
    getConsent: () => consent,
    getId: () => id,
    fetchImpl: async (url, init) => { calls.push({ url, body: init.body }); },
  });
  return { track, calls };
}

test('envia com consentimento e chave', async () => {
  const { track, calls } = setup('accepted');
  assert.equal(await track('asset_search_performed', { slug: 'nvda' }), true);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/capture\/$/);
  const body = JSON.parse(calls[0].body);
  assert.equal(body.event, 'asset_search_performed');
  assert.equal(body.distinct_id, 'anon-1');
  assert.equal(body.properties.slug, 'nvda');
});

test('não envia sem consentimento, recusado, sem chave ou sem id', async () => {
  for (const s of [setup('unset'), setup('rejected'), setup('accepted', ''), setup('accepted', 'k', null)]) {
    assert.equal(await s.track('app_opened'), false);
    assert.equal(s.calls.length, 0);
  }
});

test('falha de rede não lança', async () => {
  const track = createTracker({ key: 'k', getConsent: () => 'accepted', getId: () => 'x', fetchImpl: async () => { throw new Error('offline'); } });
  assert.equal(await track('app_opened'), false);
});
