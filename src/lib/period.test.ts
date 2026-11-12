import assert from 'node:assert/strict';
import { test } from 'node:test';

import { inRange, parseDay, resolveRange } from './period';

const NOW = new Date('2026-11-12T12:00:00Z');

test('parseDay aceita datas válidas e rejeita inválidas', () => {
  assert.ok(parseDay('2026-11-12'));
  assert.equal(parseDay('2026-02-30'), null);
  assert.equal(parseDay('12-11-2026'), null);
  assert.equal(parseDay(''), null);
});

test('períodos fixos terminam em "agora"', () => {
  const day = resolveRange('24h', '', '', NOW);
  assert.ok(day);
  assert.equal(day.end.getTime(), NOW.getTime());
  assert.equal(NOW.getTime() - day.start.getTime(), 24 * 3600 * 1000);

  const week = resolveRange('7d', '', '', NOW);
  assert.ok(week);
  assert.equal(NOW.getTime() - week.start.getTime(), 7 * 24 * 3600 * 1000);
});

test('período personalizado inclui o dia final inteiro', () => {
  const range = resolveRange('custom', '2026-11-01', '2026-11-03', NOW);
  assert.ok(range);
  assert.ok(inRange('2026-11-03T23:30:00Z', range));
  assert.ok(!inRange('2026-11-04T00:00:00Z', range));
  assert.ok(!inRange('2026-10-31T23:59:00Z', range));
});

test('período personalizado inválido devolve null', () => {
  assert.equal(resolveRange('custom', '2026-11-05', '2026-11-01', NOW), null);
  assert.equal(resolveRange('custom', 'abc', '2026-11-01', NOW), null);
  assert.equal(resolveRange('custom', '', '', NOW), null);
});
