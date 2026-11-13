import test from 'node:test'
import assert from 'node:assert/strict'
import { buildIcs, currenciesOf, escapeText, foldLine, isToken, type IcsEvent } from './index'

const NOW = new Date('2026-11-13T12:00:00Z')
const ev = (over: Partial<IcsEvent> = {}): IcsEvent => ({
  id: 'bls-1', title: 'Inflation (CPI) – US', country: 'United States', currency: 'USD', impact: 'high',
  starts_at: '2026-12-10T13:30:00Z', forecast: null, previous: '3.1%', ...over,
})

test('isToken só aceita UUIDs', () => {
  assert.equal(isToken('0b6c7128-4824-43cf-aa71-862132725251'), true)
  assert.equal(isToken('x'), false)
  assert.equal(isToken(null), false)
  assert.equal(isToken("0b6c7128-4824-43cf-aa71-862132725251' or 1=1"), false)
})

test('escapeText escapa vírgula, ponto e vírgula, barra e quebra de linha', () => {
  assert.equal(escapeText('a,b;c\\d\ne'), 'a\\,b\;c\\\\d\\ne')
})

test('foldLine dobra a 75 octetos sem partir carateres multibyte', () => {
  const long = 'SUMMARY:' + 'ç'.repeat(80)
  const folded = foldLine(long)
  const parts = folded.split('\r\n')
  assert.ok(parts.length > 1)
  assert.ok(parts.every((p, i) => new TextEncoder().encode(p).length <= 75 + (i === 0 ? 0 : 0)))
  assert.equal(parts.map((p, i) => (i === 0 ? p : p.slice(1))).join(''), long)
  assert.equal(foldLine('curta'), 'curta')
})

test('buildIcs gera um calendário válido, ordenado, em UTC e com CRLF', () => {
  const ics = buildIcs([ev({ id: 'b', starts_at: '2026-12-11T10:00:00Z' }), ev()], NOW, ['USD'])
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'))
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'))
  assert.ok(!/[^\r]\n/.test(ics), 'só CRLF')
  assert.equal(ics.match(/BEGIN:VEVENT/g)?.length, 2)
  assert.ok(ics.indexOf('bls-1@marketlens') < ics.indexOf('b@marketlens'), 'ordenado por data')
  assert.ok(ics.includes('DTSTART:20261210T133000Z'))
  assert.ok(ics.includes('DTEND:20261210T134500Z'))
  assert.ok(ics.includes('DTSTAMP:20261113T120000Z'))
  assert.ok(ics.includes('X-WR-CALNAME:Market Factory News (USD)'))
  assert.ok(ics.includes('Previous: 3.1%'))
})

test('buildIcs: título com vírgula, impacto e moeda; ignora datas inválidas; vazio é válido', () => {
  const ics = buildIcs([ev({ title: 'Rates, decision; today' }), ev({ id: 'bad', starts_at: 'lixo' })], NOW)
  assert.ok(ics.includes('Rates\\, decision\; today (USD)'))
  assert.equal(ics.match(/BEGIN:VEVENT/g)?.length, 1)
  assert.ok(ics.includes('DESCRIPTION:Impact: High\\nCountry: United States'))
  const empty = buildIcs([], NOW)
  assert.ok(empty.includes('BEGIN:VCALENDAR') && !empty.includes('VEVENT'))
})

test('currenciesOf junta moedas sem repetir', () => {
  assert.deepEqual(currenciesOf([{ currencies: ['USD', 'EUR'] }, { currencies: ['USD'] }, { currencies: null }]), ['EUR', 'USD'])
})
