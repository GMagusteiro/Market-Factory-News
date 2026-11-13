import test from 'node:test';
import assert from 'node:assert/strict';
import { feedUrl, googleAddUrl, webcalUrl } from './calendarFeed';

test('feedUrl junta base e token, ignora barras finais e falta de dados', () => {
  assert.equal(feedUrl('https://x.supabase.co/', 'abc'), 'https://x.supabase.co/functions/v1/calendar-ics?token=abc');
  assert.equal(feedUrl(undefined, 'abc'), null);
  assert.equal(feedUrl('https://x.supabase.co', null), null);
});

test('webcal e Google usam o mesmo endereço', () => {
  const url = 'https://x.supabase.co/functions/v1/calendar-ics?token=abc';
  assert.equal(webcalUrl(url), 'webcal://x.supabase.co/functions/v1/calendar-ics?token=abc');
  assert.ok(googleAddUrl(url).startsWith('https://calendar.google.com/calendar/r?cid=webcal'));
});
