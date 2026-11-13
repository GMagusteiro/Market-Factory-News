import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TIME_ZONE, isStoredTimeZone, resolveTimeZone } from './timezones';
import { dayKey, formatTime, setDisplayTimeZone } from './format';

test('resolveTimeZone: device, válido e inválido', () => {
  assert.equal(resolveTimeZone('device', 'America/Chicago'), 'America/Chicago');
  assert.equal(resolveTimeZone('device', 'Nao/Existe'), DEFAULT_TIME_ZONE);
  assert.equal(resolveTimeZone('Asia/Tokyo'), 'Asia/Tokyo');
  assert.equal(resolveTimeZone('lixo'), DEFAULT_TIME_ZONE);
});

test('isStoredTimeZone só aceita device ou IANA válido', () => {
  assert.equal(isStoredTimeZone('device'), true);
  assert.equal(isStoredTimeZone('Europe/Lisbon'), true);
  assert.equal(isStoredTimeZone('x'.repeat(100)), false);
  assert.equal(isStoredTimeZone(42), false);
});

test('format segue o fuso escolhido (hora e chave do dia)', () => {
  const iso = '2026-12-09T23:30:00Z';
  setDisplayTimeZone('UTC');
  assert.equal(formatTime(iso, 'en-GB'), '23:30');
  assert.equal(dayKey(iso), '2026-12-09');
  setDisplayTimeZone('Asia/Tokyo'); // UTC+9: já é dia 10
  assert.equal(formatTime(iso, 'en-GB'), '08:30');
  assert.equal(dayKey(iso), '2026-12-10');
  setDisplayTimeZone('Europe/Lisbon');
});
