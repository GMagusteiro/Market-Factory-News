import test from 'node:test'
import assert from 'node:assert/strict'
import { parseFeed, matchAssets, matchThemes, buildRows, normalizeUrl, shortSummary, userAgent, parseIcs, blsRows, sec8kRows, sec8kUrl, zonedToUtc, type AssetRef, type FeedConfig } from './index'

const rss = `<?xml version="1.0"?><rss version="2.0"><channel>
<item><title><![CDATA[Fed holds interest rate &amp; signals patience]]></title>
<link>http://www.federalreserve.gov/newsevents/pressreleases/monetary20261112a.htm?utm_source=x#top</link>
<pubDate>Wed, 11 Nov 2026 19:00:00 GMT</pubDate>
<description>&lt;p&gt;The FOMC decided to maintain the target range. NVIDIA was not mentioned.&lt;/p&gt;</description></item>
<item><title>Sem data</title><link>https://a.com/x</link></item>
<item><title>Duplicado</title><link>https://www.federalreserve.gov/newsevents/pressreleases/monetary20261112a.htm</link><pubDate>Wed, 11 Nov 2026 20:00:00 GMT</pubDate></item>
</channel></rss>`

const atom = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>SEC charges firm</title>
<link rel="alternate" href="https://www.sec.gov/news/1"/><updated>2026-11-10T10:00:00Z</updated><summary>Short.</summary></entry></feed>`

const assets: AssetRef[] = [
  { slug: 'nvda', symbol: 'NVDA', name: 'NVIDIA', aliases: ['Nvidia Corp'] },
  { slug: 'amd', symbol: 'AMD', name: 'AMD', aliases: [] },
  { slug: 'a', symbol: 'A', name: 'Agilent', aliases: [] },
]
const feed: FeedConfig = { sourceId: 'fed', url: 'x', type: 'official' }
const NOW = new Date('2026-11-12T12:00:00Z')

test('parseFeed lê RSS: decodifica, limpa tags e descarta itens sem data', () => {
  const items = parseFeed(rss)
  assert.equal(items.length, 2)
  assert.equal(items[0].title, 'Fed holds interest rate & signals patience')
  assert.equal(items[0].url, 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20261112a.htm')
  assert.equal(items[0].publishedAt, '2026-11-11T19:00:00.000Z')
  assert.match(items[0].description, /^The FOMC decided/)
})

test('parseFeed lê Atom', () => {
  const items = parseFeed(atom)
  assert.equal(items.length, 1)
  assert.equal(items[0].url, 'https://www.sec.gov/news/1')
})

test('normalizeUrl remove tracking, fragmento e barra final', () => {
  assert.equal(normalizeUrl('http://a.com/p/?utm_source=x&id=2#f'), 'https://a.com/p?id=2')
  assert.equal(normalizeUrl('lixo'), '')
})

test('matchAssets: nome, alias e símbolo, sem falsos positivos', () => {
  assert.deepEqual(matchAssets('Nvidia Corp rises', assets), ['nvda'])
  assert.deepEqual(matchAssets('AMD and NVDA', assets).sort(), ['amd', 'nvda'])
  assert.deepEqual(matchAssets('Armed forces, a plan', assets), [])
})

test('matchThemes por palavras-chave', () => {
  assert.deepEqual(matchThemes('FOMC keeps rates'), ['taxas-de-juro'])
  assert.deepEqual(matchThemes('Nothing relevant'), [])
})

test('buildRows: deduplica, filtra datas antigas/futuras e liga ativos e temas', () => {
  const items = [
    ...parseFeed(rss),
    { title: 'Antigo', url: 'https://a.com/old', publishedAt: '2026-01-01T00:00:00Z', description: '' },
    { title: 'Futuro', url: 'https://a.com/fut', publishedAt: '2026-12-31T00:00:00Z', description: '' },
  ]
  const rows = buildRows(items, feed, assets, NOW)
  assert.equal(rows.length, 1) // o duplicado colapsa; antigo e futuro caem
  assert.deepEqual(rows[0].themes, ['taxas-de-juro'])
  assert.deepEqual(rows[0].assets, ['nvda'])
  assert.equal(rows[0].article.is_sample, false)
})

test('resumo só em fontes oficiais e com limite', () => {
  const long = { title: 't', url: 'u', publishedAt: 'd', description: 'palavra '.repeat(100) }
  assert.ok(shortSummary(long, 'official')!.length <= 201)
  assert.equal(shortSummary(long, 'news'), null)
})

test('userAgent usa o contacto fornecido e nunca o inventa', () => {
  assert.equal(userAgent('a@b.pt'), 'Market Factory News/1.0 (a@b.pt)')
  assert.equal(userAgent(undefined), 'Market Factory News/1.0 (sem-contacto)')
})

const ICS = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:aaa
DTSTART;TZID=US-Eastern:20261210T083000
SUMMARY:Consumer Price Index
CATEGORIES:IMPORTANT, BLS
END:VEVENT
BEGIN:VEVENT
UID:bbb
DTSTART;TZID=US-Eastern:20270312T083000
SUMMARY:Employment Situation
END:VEVENT
BEGIN:VEVENT
UID:ccc
DTSTART;TZID=US-Eastern:20261215T100000
SUMMARY:Metropolitan Area Employment and
  Unemployment (Monthly)
END:VEVENT
BEGIN:VEVENT
UID:ddd
DTSTART;VALUE=DATE:20261225
SUMMARY:Christmas
END:VEVENT
BEGIN:VEVENT
UID:eee
DTSTART;TZID=US-Eastern:20250103T100000
SUMMARY:Antigo
END:VEVENT
END:VCALENDAR`

test('parseIcs: fuso US-Eastern, dobra de linhas e ignora dia inteiro', () => {
  const ev = parseIcs(ICS)
  assert.equal(ev.length, 4)
  assert.equal(ev[0].startsAt.toISOString(), '2026-12-10T13:30:00.000Z') // EST, UTC-5
  assert.equal(ev[1].startsAt.toISOString(), '2027-03-12T13:30:00.000Z') // antes do verão (14 mar)
  assert.equal(ev[2].summary, 'Metropolitan Area Employment and Unemployment (Monthly)')
})

test('blsRows: janela de datas, título em inglês, impacto e id estável', () => {
  const rows = blsRows(ICS, new Date('2026-11-12T12:00:00Z'))
  assert.deepEqual(rows.map((r) => r.id), ['bls-aaa', 'bls-ccc']) // bbb está a mais de 120 dias; eee é antigo
  assert.equal(rows[0].title, 'Inflation (CPI) – US')
  assert.equal(rows[0].impact, 'high')
  assert.equal(rows[1].impact, 'low')
  assert.match(rows[1].title, /\(BLS\)$/)
})

test('zonedToUtc da função respeita o horário de verão', () => {
  assert.equal(zonedToUtc('2027-04-01', '08:30', 'America/New_York').toISOString(), '2027-04-01T12:30:00.000Z')
})

const rdf = `<?xml version="1.0"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://purl.org/rss/1.0/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel rdf:about="https://www.bankofcanada.ca/"><title>Press releases</title></channel>
<item rdf:about="https://www.bankofcanada.ca/2026/10/fad-press-release-2026-10-28/"><title>Bank of Canada raises the policy rate by 25 basis points to 2½%</title>
<link>https://www.bankofcanada.ca/2026/10/fad-press-release-2026-10-28/</link><dc:date>2026-10-28T09:47:20+00:00</dc:date><description>The Bank of Canada today raised its target for the overnight rate.</description></item>
</rdf:RDF>`

test('parseFeed lê RSS 1.0 (RDF) do Banco do Canadá com dc:date e liga ao tema de taxas', () => {
  const items = parseFeed(rdf)
  assert.equal(items.length, 1)
  assert.equal(items[0].publishedAt, '2026-10-28T09:47:20.000Z')
  const rows = buildRows(items, { sourceId: 'boc', url: 'x', type: 'official' }, assets, new Date('2026-11-13T12:00:00Z'))
  assert.equal(rows.length, 1)
  assert.deepEqual(rows[0].themes, ['taxas-de-juro'])
  assert.equal(rows[0].article.source_id, 'boc')
})

const edgar = `<?xml version="1.0" encoding="ISO-8859-1"?><feed xmlns="http://www.w3.org/2005/Atom"><title>NVIDIA CORP</title>
<entry><title>8-K  - Current report</title><link rel="alternate" type="text/html" href="https://www.sec.gov/Archives/edgar/data/1045810/000104581026000123/0001045810-26-000123-index.htm"/>
<summary type="html">&lt;b&gt;Filed:&lt;/b&gt; 2026-11-10 &lt;b&gt;AccNo:&lt;/b&gt; 0001045810-26-000123 &lt;b&gt;Size:&lt;/b&gt; 250 KB
Item 5.02: Departure of Directors or Certain Officers
Item 9.01: Financial Statements and Exhibits</summary><updated>2026-11-10T16:05:12-05:00</updated></entry>
<entry><title>8-K  - Current report</title><link rel="alternate" type="text/html" href="https://www.sec.gov/Archives/edgar/data/1045810/x-index.htm"/>
<summary type="html">Item 9.01: Financial Statements and Exhibits</summary><updated>2026-11-09T10:00:00-05:00</updated></entry>
<entry><title>8-K  - Current report</title><link rel="alternate" type="text/html" href="https://www.sec.gov/Archives/edgar/data/1045810/old-index.htm"/>
<summary type="html">Item 2.02: Results of Operations</summary><updated>2026-09-01T10:00:00-05:00</updated></entry>
</feed>`

test('sec8kRows: só 8-K com itens relevantes e recentes, ligados ao ativo', () => {
  const rows = sec8kRows(edgar, assets[0], new Date('2026-11-13T12:00:00Z'))
  assert.equal(rows.length, 1) // sem 9.01 sozinho, sem filing antigo
  assert.equal(rows[0].article.title, 'NVIDIA: SEC 8-K filing on departure or appointment of directors or officers')
  assert.equal(rows[0].article.summary, 'Form 8-K, items 5.02, 9.01.')
  assert.deepEqual(rows[0].assets, ['nvda'])
  assert.equal(rows[0].article.source_id, 'sec')
  assert.equal(rows[0].article.published_at, '2026-11-10T21:05:12.000Z')
})

test('sec8kRows: página de erro da SEC (sem feed) dá zero linhas; url usa o símbolo', () => {
  assert.deepEqual(sec8kRows('<html>No matching Ticker Symbol.</html>', assets[0]), [])
  assert.ok(sec8kUrl('BRK.B').includes('CIK=BRK.B') && sec8kUrl('A B').includes('CIK=A%20B'))
})
