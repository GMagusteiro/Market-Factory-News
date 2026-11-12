import test from 'node:test';
import assert from 'node:assert/strict';
import { zonedToUtc } from './zoned';

test('Nova Iorque: inverno (EST, UTC-5) e verão (EDT, UTC-4)', () => {
  assert.equal(zonedToUtc('2026-12-09', '14:00', 'America/New_York').toISOString(), '2026-12-09T19:00:00.000Z');
  assert.equal(zonedToUtc('2027-06-09', '14:00', 'America/New_York').toISOString(), '2027-06-09T18:00:00.000Z');
});

test('Nova Iorque: 17 mar 2027 já está em horário de verão (começou a 14 mar)', () => {
  assert.equal(zonedToUtc('2027-03-17', '14:00', 'America/New_York').toISOString(), '2027-03-17T18:00:00.000Z');
});

test('Londres: GMT no inverno e BST no verão (começa a 28 mar 2027)', () => {
  assert.equal(zonedToUtc('2026-11-05', '12:00', 'Europe/London').toISOString(), '2026-11-05T12:00:00.000Z');
  assert.equal(zonedToUtc('2027-03-18', '12:00', 'Europe/London').toISOString(), '2027-03-18T12:00:00.000Z');
  assert.equal(zonedToUtc('2027-04-29', '12:00', 'Europe/London').toISOString(), '2027-04-29T11:00:00.000Z');
});
