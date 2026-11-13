import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_LANG, isLang, translate } from './index';
import { messages, type Lang, type MessageKey } from './messages';

const LANGS: Lang[] = ['pt', 'en', 'es'];

test('todos os idiomas têm exatamente as mesmas chaves e nenhuma está vazia', () => {
  const keys = Object.keys(messages.pt).sort();
  for (const lang of LANGS) {
    assert.deepEqual(Object.keys(messages[lang]).sort(), keys, lang);
    for (const key of keys) assert.ok(messages[lang][key as MessageKey].trim(), `${lang}:${key}`);
  }
});

test('os marcadores {nome} são os mesmos em todos os idiomas', () => {
  const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const key of Object.keys(messages.pt) as MessageKey[]) {
    for (const lang of LANGS) {
      assert.deepEqual(placeholders(messages[lang][key]), placeholders(messages.pt[key]), `${lang}:${key}`);
    }
  }
});

test('translate substitui os parâmetros e deixa os desconhecidos visíveis', () => {
  assert.equal(translate('en', 'nav.watchlistN', { n: 3 }), 'Watchlist (3)');
  assert.equal(translate('es', 'calendar.upcoming', { n: 7 }), 'Próximos 7 días');
  assert.equal(translate('pt', 'nav.watchlistN'), 'Watchlist ({n})');
});

test('o idioma por omissão é inglês e só aceita pt, en, es', () => {
  assert.equal(DEFAULT_LANG, 'en');
  assert.equal(isLang('es'), true);
  assert.equal(isLang('zh'), false);
})

