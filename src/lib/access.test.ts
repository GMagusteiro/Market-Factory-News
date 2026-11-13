import assert from 'node:assert/strict';
import test from 'node:test';

import { CALENDAR_AHEAD_DAYS, canUsePeriod, mergeWatchlists } from './access';

test('visitante só usa 24h e 7 dias; com conta usa tudo', () => {
  assert.equal(canUsePeriod('24h', 'guest', true), true);
  assert.equal(canUsePeriod('7d', 'guest', true), true);
  assert.equal(canUsePeriod('30d', 'guest', true), false);
  assert.equal(canUsePeriod('custom', 'guest', true), false);
  for (const tier of ['free', 'premium'] as const) {
    assert.equal(canUsePeriod('30d', tier, true), true);
    assert.equal(canUsePeriod('custom', tier, true), true);
  }
});

test('sem autenticação configurada nada fica bloqueado', () => {
  assert.equal(canUsePeriod('30d', 'guest', false), true);
});

test('calendário aberto a todos: 60 dias à frente', () => {
  assert.equal(CALENDAR_AHEAD_DAYS, 60);
});

test('mergeWatchlists junta sem repetir e mantém a ordem da conta', () => {
  assert.deepEqual(mergeWatchlists(['aapl', 'nvda'], ['nvda', 'tsla']), ['nvda', 'tsla', 'aapl']);
  assert.deepEqual(mergeWatchlists([], []), []);
});
