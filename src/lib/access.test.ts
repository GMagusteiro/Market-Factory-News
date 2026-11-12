import assert from 'node:assert/strict';
import test from 'node:test';

import { calendarAheadDays, canSeeCalendarHistory, canUsePeriod, mergeWatchlists } from './access';

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
  assert.equal(canSeeCalendarHistory('guest', false), true);
  assert.equal(calendarAheadDays('guest', false), 14);
});

test('calendário: visitante vê 7 dias à frente e sem histórico', () => {
  assert.equal(canSeeCalendarHistory('guest', true), false);
  assert.equal(canSeeCalendarHistory('free', true), true);
  assert.equal(calendarAheadDays('guest', true), 7);
  assert.equal(calendarAheadDays('free', true), 14);
});

test('mergeWatchlists junta sem repetir e mantém a ordem da conta', () => {
  assert.deepEqual(mergeWatchlists(['aapl', 'nvda'], ['nvda', 'tsla']), ['nvda', 'tsla', 'aapl']);
  assert.deepEqual(mergeWatchlists([], []), []);
});
