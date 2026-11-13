// Edge Function: recolhe feeds RSS/Atom oficiais e guarda título, fonte, data, link e (só em fontes oficiais) um excerto curto.
// Ficheiro único para poder ser colado no painel do Supabase. A chave de serviço só existe aqui (variáveis do servidor).
// A SEC exige contacto no User-Agent: definir o segredo INGEST_CONTACT (email) nas variáveis da função.

export type FeedConfig = { sourceId: string; url: string; type: 'news' | 'opinion' | 'official' }
export type ParsedItem = { title: string; url: string; publishedAt: string; description: string }
export type AssetRef = { slug: string; symbol: string; name: string; aliases: string[]; cik?: string | null }

export function userAgent(contact: string | undefined): string {
  return `Market Factory News/1.0 (${contact || 'sem-contacto'})`
}

export const FEEDS: FeedConfig[] = [
  { sourceId: 'fed', url: 'https://www.federalreserve.gov/feeds/press_all.xml', type: 'official' },
  { sourceId: 'fed', url: 'https://www.federalreserve.gov/feeds/press_monetary.xml', type: 'official' },
  { sourceId: 'bce', url: 'https://www.ecb.europa.eu/rss/press.html', type: 'official' },
  { sourceId: 'sec', url: 'https://www.sec.gov/news/pressreleases.rss', type: 'official' },
  { sourceId: 'boc', url: 'https://www.bankofcanada.ca/content_type/press-releases/feed/', type: 'official' },
]

export const THEME_KEYWORDS: Record<string, string[]> = {
  'taxas-de-juro': ['interest rate', 'policy rate', 'fomc', 'monetary policy', 'rate decision', 'federal funds', 'key ecb interest rates'],
  energia: ['oil', 'natural gas', 'energy prices', 'crude', 'opec'],
  'semicondutores-ia': ['semiconductor', 'artificial intelligence', 'chips'],
  'terras-raras': ['rare earth', 'magnet'],
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

export function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
}

export function stripTags(s: string): string {
  return decode(decode(s).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'))
  return m ? m[1].trim() : ''
}

function atomLink(block: string): string {
  const alt = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i)
  const any = block.match(/<link[^>]*href=["']([^"']+)["']/i)
  return (alt ?? any)?.[1] ?? ''
}

export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw.trim())
    u.hash = ''
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/i.test(k)) u.searchParams.delete(k)
    u.protocol = 'https:'
    u.pathname = u.pathname.replace(/\/+$/, '') || '/'
    return u.toString().replace(/\/$/, '')
  } catch {
    return ''
  }
}

// RSS 2.0, RSS 1.0 (RDF) e Atom. Itens inválidos (sem título, link ou data) são descartados.
export function parseFeed(xml: string): ParsedItem[] {
  const blocks = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map((m) => m[2])
  const out: ParsedItem[] = []
  for (const b of blocks) {
    const title = stripTags(tag(b, 'title'))
    const url = normalizeUrl(stripTags(tag(b, 'link')) || atomLink(b))
    const dateRaw = tag(b, 'pubDate') || tag(b, 'dc:date') || tag(b, 'published') || tag(b, 'updated')
    const d = new Date(stripTags(dateRaw))
    if (!title || !url || Number.isNaN(d.getTime())) continue
    const description = stripTags(tag(b, 'description') || tag(b, 'summary') || tag(b, 'content'))
    out.push({ title, url, publishedAt: d.toISOString(), description })
  }
  return out
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

type Matcher = { slug: string; names: RegExp[]; lowerNames: string[]; symbol: RegExp | null; symbolLower: string }
// Compila as expressões uma única vez por lista de ativos (com 500+ empresas, compilar por artigo esgotava o CPU da função).
const matcherCache = new WeakMap<AssetRef[], Matcher[]>()

function matchersFor(assets: AssetRef[]): Matcher[] {
  let m = matcherCache.get(assets)
  if (m) return m
  m = assets.map((a) => {
    const names = [a.name, ...a.aliases].filter((n) => n.length >= 3)
    return {
      slug: a.slug,
      names: names.map((n) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(n)}($|[^\\p{L}\\p{N}])`, 'iu')),
      lowerNames: names.map((n) => n.toLowerCase()),
      // símbolo só em maiúsculas e com 3+ letras, para evitar falsos positivos
      symbol: a.symbol.length >= 3 ? new RegExp(`(^|[^A-Za-z0-9])${escapeRe(a.symbol)}($|[^A-Za-z0-9])`) : null,
      symbolLower: a.symbol.toLowerCase(),
    }
  })
  matcherCache.set(assets, m)
  return m
}

export function matchAssets(text: string, assets: AssetRef[]): string[] {
  const hits: string[] = []
  const lower = text.toLowerCase()
  for (const a of matchersFor(assets)) {
    // pré-filtro barato: só corre a expressão se o texto contiver o nome ou o símbolo
    const byName = a.names.some((re, i) => lower.includes(a.lowerNames[i]) && re.test(text))
    const bySymbol = a.symbol !== null && lower.includes(a.symbolLower) && a.symbol.test(text)
    if (byName || bySymbol) hits.push(a.slug)
  }
  return hits
}

export function matchThemes(text: string, keywords: Record<string, string[]> = THEME_KEYWORDS): string[] {
  const t = text.toLowerCase()
  return Object.entries(keywords)
    .filter(([, ks]) => ks.some((k) => t.includes(k)))
    .map(([id]) => id)
}

// Resumo curto: só para fontes oficiais (conteúdo público); para as restantes fica vazio.
export function shortSummary(item: ParsedItem, type: FeedConfig['type'], max = 200): string | null {
  if (type !== 'official' || !item.description) return null
  const d = item.description
  if (d.length <= max) return d
  return d.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

export type Row = {
  article: { source_id: string; type: string; title: string; summary: string | null; url: string; published_at: string; is_sample: false }
  assets: string[]
  themes: string[]
}

export function buildRows(items: ParsedItem[], feed: FeedConfig, assets: AssetRef[], now = new Date(), maxAgeDays = 30): Row[] {
  const seen = new Set<string>()
  const rows: Row[] = []
  const limit = now.getTime() - maxAgeDays * 86_400_000
  for (const it of items) {
    if (seen.has(it.url)) continue
    seen.add(it.url)
    const ts = new Date(it.publishedAt).getTime()
    if (ts < limit || ts > now.getTime() + 3_600_000) continue
    const text = `${it.title} ${it.description}`
    rows.push({
      article: { source_id: feed.sourceId, type: feed.type, title: it.title, summary: shortSummary(it, feed.type), url: it.url, published_at: it.publishedAt, is_sample: false },
      assets: matchAssets(text, assets),
      themes: matchThemes(text),
    })
  }
  return rows
}

// ---------- Notícias de empresas: relatórios 8-K da SEC (oficiais, gratuitos) ----------
// As empresas cotadas nos EUA têm de declarar à SEC factos relevantes (ex.: saída de um CEO, Item 5.02).
export const SEC_8K_ITEMS: Record<string, string> = {
  '1.01': 'entered into a material agreement',
  '1.02': 'ended a material agreement',
  '1.03': 'bankruptcy or receivership',
  '2.01': 'completed an acquisition or disposal',
  '2.02': 'results of operations',
  '2.05': 'exit or restructuring costs',
  '2.06': 'material impairment',
  '3.01': 'delisting or listing notice',
  '4.01': 'change of auditor',
  '4.02': 'non-reliance on previous financial statements',
  '5.01': 'change in control',
  '5.02': 'departure or appointment of directors or officers',
}

export const sec8kUrl = (symbol: string): string =>
  `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(symbol)}&type=8-K&dateb=&owner=include&count=10&output=atom`

function row8k(it: ParsedItem, asset: AssetRef, known: string[], codes: string[]): Row {
  return {
    article: {
      source_id: 'sec',
      type: 'official',
      title: `${asset.name}: SEC 8-K filing on ${known.map((c) => SEC_8K_ITEMS[c]).join('; ')}`,
      summary: `Form 8-K, items ${codes.join(', ')}.`,
      url: it.url,
      published_at: it.publishedAt,
      is_sample: false,
    },
    assets: [asset.slug],
    themes: [],
  }
}

function items8k(it: ParsedItem): { known: string[]; codes: string[] } {
  const codes = [...new Set([...it.description.matchAll(/Item\s+(\d\.\d{2})/g)].map((m) => m[1]))]
  return { known: codes.filter((c) => c in SEC_8K_ITEMS), codes }
}

function recent(it: ParsedItem, now: Date, maxAgeDays: number): boolean {
  const ts = new Date(it.publishedAt).getTime()
  return ts >= now.getTime() - maxAgeDays * 86_400_000 && ts <= now.getTime() + 3_600_000
}

/** Linhas de notícia a partir do feed Atom de 8-K de uma empresa. Só filings com pelo menos um item relevante. */
export function sec8kRows(xml: string, asset: AssetRef, now = new Date(), maxAgeDays = 14): Row[] {
  const seen = new Set<string>()
  const rows: Row[] = []
  for (const it of parseFeed(xml)) {
    if (seen.has(it.url) || !recent(it, now, maxAgeDays)) continue
    seen.add(it.url)
    const { known, codes } = items8k(it)
    if (known.length) rows.push(row8k(it, asset, known, codes))
  }
  return rows
}

/** Endereço da página `start` do feed global de 8-K (100 por página, de todas as empresas). */
export const sec8kCurrentUrl = (start: number): string =>
  `https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&company=&dateb=&owner=include&start=${start}&count=100&output=atom`

/** Feed global: o título traz o CIK ("8-K - Apple Inc. (0000320193) (Filer)"); só ficam empresas do universo (assets com cik). */
export function sec8kCurrentRows(xml: string, assets: AssetRef[], now = new Date(), maxAgeDays = 14): Row[] {
  const byCik = new Map(assets.filter((a) => a.cik).map((a) => [String(a.cik).replace(/^0+/, ''), a]))
  const seen = new Set<string>()
  const rows: Row[] = []
  for (const it of parseFeed(xml)) {
    const cik = it.title.match(/\((\d{10})\)/)?.[1]?.replace(/^0+/, '')
    const asset = cik ? byCik.get(cik) : undefined
    if (!asset || seen.has(it.url) || !recent(it, now, maxAgeDays)) continue
    seen.add(it.url)
    const { known, codes } = items8k(it)
    if (known.length) rows.push(row8k(it, asset, known, codes))
  }
  return rows
}

// ---------- Calendário (BLS, ficheiro ICS oficial e gratuito) ----------
export const BLS_ICS_URL = 'https://www.bls.gov/schedule/news_release/bls.ics'

export type CalendarRow = {
  id: string; title: string; country: string; currency: string
  impact: 'low' | 'medium' | 'high'; starts_at: string; is_sample: false
}

/** Hora local de um fuso IANA para UTC, com horário de verão. */
export function zonedToUtc(date: string, time: string, timeZone: string): Date {
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  const asUtc = Date.UTC(y, mo - 1, d, h, mi)
  const offsetAt = (ms: number) => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(new Date(ms))
    const get = (t: string) => Number(parts.find((p) => p.type === t)!.value)
    return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute')) - ms
  }
  let guess = asUtc - offsetAt(asUtc)
  guess = asUtc - offsetAt(guess)
  return new Date(guess)
}

export type IcsEvent = { uid: string; summary: string; startsAt: Date }

/** Lê VEVENTs de um ICS. Ignora eventos de dia inteiro ou sem UID/hora. */
export function parseIcs(ics: string): IcsEvent[] {
  const lines = ics.replace(/\r/g, '').replace(/\n[ \t]/g, '').split('\n')
  const out: IcsEvent[] = []
  let cur: Record<string, string> | null = null
  let dtParams = ''
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { cur = {}; dtParams = ''; continue }
    if (line === 'END:VEVENT') {
      if (cur?.UID && cur.SUMMARY && cur.DTSTART && !/VALUE=DATE(?!-)/.test(dtParams) && /T\d{6}Z?$/.test(cur.DTSTART)) {
        const m = cur.DTSTART.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})\d{2}(Z?)$/)!
        const [, y, mo, d, h, mi, z] = m
        let startsAt: Date | null = null
        if (z) startsAt = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi))
        else if (/TZID=US-Eastern|TZID=America\/New_York/.test(dtParams)) startsAt = zonedToUtc(`${y}-${mo}-${d}`, `${h}:${mi}`, 'America/New_York')
        if (startsAt && !Number.isNaN(startsAt.getTime())) out.push({ uid: cur.UID, summary: cur.SUMMARY.replace(/\\,/g, ',').replace(/\;/g, ';').trim(), startsAt })
      }
      cur = null
      continue
    }
    if (!cur) continue
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const head = line.slice(0, idx)
    const name = head.split(';')[0]
    if (name === 'DTSTART') dtParams = head
    if (!(name in cur)) cur[name] = line.slice(idx + 1)
  }
  return out
}

// Título em inglês (idioma base do site) e impacto por tabela fixa (o BLS não classifica impacto).
const BLS_MAP: [RegExp, string, 'low' | 'medium' | 'high'][] = [
  [/^Employment Situation$/i, 'Nonfarm payrolls and unemployment (US)', 'high'],
  [/^Consumer Price Index$/i, 'Inflation (CPI) – US', 'high'],
  [/^Producer Price Index$/i, 'Producer prices (PPI) – US', 'medium'],
  [/^Job Openings and Labor Turnover Survey$/i, 'Job openings (JOLTS) – US', 'medium'],
  [/^Employment Cost Index$/i, 'Employment cost index (ECI) – US', 'medium'],
  [/^U\.S\. Import and Export Price Indexes$/i, 'Import and export prices – US', 'low'],
  [/^Productivity and Costs/i, 'Productivity and costs – US', 'low'],
  [/^Real Earnings$/i, 'Real earnings – US', 'low'],
]

export function blsToRow(ev: IcsEvent): CalendarRow {
  const hit = BLS_MAP.find(([re]) => re.test(ev.summary))
  return {
    id: `bls-${ev.uid}`,
    title: hit ? hit[1] : `${ev.summary} (BLS)`,
    country: 'United States',
    currency: 'USD',
    impact: hit ? hit[2] : 'low',
    starts_at: ev.startsAt.toISOString(),
    is_sample: false,
  }
}

/** Só eventos recentes ou próximos (últimos 14 dias e próximos 120). */
export function blsRows(ics: string, now = new Date()): CalendarRow[] {
  const from = now.getTime() - 14 * 86_400_000
  const to = now.getTime() + 120 * 86_400_000
  return parseIcs(ics).filter((e) => e.startsAt.getTime() >= from && e.startsAt.getTime() <= to).map(blsToRow)
}

// ---------- Notícias gerais importantes (GDELT: índice aberto de notícias, sem chave) ----------
// Em vez de ler sites de media, perguntamos ao GDELT por acontecimentos que mexem com empresas (saída de CEO, falência,
// fusões, investigações, avisos de resultados). Guardamos só título, fonte, data e link; só ficam os que mencionam
// uma das nossas empresas. Limite do GDELT: 1 pedido a cada 5 segundos.
export const GDELT_QUERIES: { label: string; query: string }[] = [
  { label: 'lideranca', query: '("CEO" OR "chief executive" OR "chairman") ("resigns" OR "resigned" OR "steps down" OR "stepping down" OR "ousted" OR "fired" OR "retire")' },
  { label: 'falencia', query: '("files for bankruptcy" OR "chapter 11" OR "insolvency" OR "default on debt")' },
  { label: 'regulacao', query: '("SEC charges" OR "SEC investigation" OR "DOJ probe" OR "antitrust" OR "fined" OR "product recall")' },
  { label: 'fusoes', query: '("to acquire" OR "agrees to buy" OR "takeover" OR "merger" OR "buyout")' },
  { label: 'resultados', query: '("profit warning" OR "cuts guidance" OR "raises guidance" OR "earnings miss" OR "earnings beat" OR "stock split")' },
  { label: 'mercado', query: '("shares plunge" OR "shares surge" OR "stock tumbles" OR "stock soars" OR "trading halted")' },
]
export const GDELT_TIMESPAN = '3h'

export type GdeltArticle = { url: string; title: string; seendate: string; domain: string; language?: string }

export function gdeltUrl(query: string, timespan = GDELT_TIMESPAN, max = 75): string {
  const params = new URLSearchParams({ query: `${query} sourcelang:english`, mode: 'ArtList', format: 'json', maxrecords: String(max), sort: 'DateDesc', timespan })
  return `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`
}

export function parseGdelt(text: string): GdeltArticle[] {
  // Quando há limite de pedidos o GDELT responde texto simples, não JSON.
  let data: any
  try { data = JSON.parse(text) } catch { throw new Error(text.trim().slice(0, 80) || 'resposta vazia') }
  return Array.isArray(data?.articles) ? data.articles : []
}

/** "20261113T193000Z" -> ISO. */
export function gdeltDate(seen: string): string | null {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(seen ?? '')
  if (!m) return null
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

const TIER1_DOMAINS = ['reuters.com', 'bloomberg.com', 'wsj.com', 'ft.com', 'apnews.com', 'cnbc.com']
const TIER2_DOMAINS = ['marketwatch.com', 'barrons.com', 'nytimes.com', 'theguardian.com', 'bbc.com', 'bbc.co.uk', 'cnn.com', 'forbes.com', 'businessinsider.com', 'finance.yahoo.com', 'yahoo.com', 'axios.com', 'fortune.com', 'economist.com', 'investors.com']

export function domainTier(domain: string): 1 | 2 | 3 {
  const d = domain.toLowerCase().replace(/^www\./, '')
  const is = (list: string[]) => list.some((x) => d === x || d.endsWith(`.${x}`))
  return is(TIER1_DOMAINS) ? 1 : is(TIER2_DOMAINS) ? 2 : 3
}

export function gdeltSourceId(domain: string): string {
  return 'web-' + domain.toLowerCase().replace(/^www\./, '').replace(/[^a-z0-9.-]/g, '')
}

export type GdeltSource = { id: string; name: string; type: 'news'; tier: 1 | 2 | 3 }

export function gdeltRows(items: GdeltArticle[], assets: AssetRef[], now = new Date(), maxAgeHours = 24): { rows: Row[]; sources: GdeltSource[] } {
  const seen = new Set<string>()
  const rows: Row[] = []
  const sources = new Map<string, GdeltSource>()
  const earliest = now.getTime() - maxAgeHours * 3_600_000
  for (const it of items) {
    if (!it?.url || !/^https?:\/\//i.test(it.url) || seen.has(it.url)) continue
    seen.add(it.url)
    const title = decode(String(it.title ?? '')).replace(/\s+/g, ' ').trim()
    const published = gdeltDate(it.seendate)
    const domain = String(it.domain ?? '').trim()
    if (title.length < 15 || !published || !domain) continue
    const ts = Date.parse(published)
    if (ts < earliest || ts > now.getTime() + 3_600_000) continue
    const matched = matchAssets(title, assets)
    if (matched.length === 0) continue // só interessam notícias sobre empresas que seguimos
    const id = gdeltSourceId(domain)
    if (!sources.has(id)) sources.set(id, { id, name: domain.replace(/^www\./, ''), type: 'news', tier: domainTier(domain) })
    rows.push({
      article: { source_id: id, type: 'news', title, summary: null, url: it.url, published_at: published, is_sample: false },
      assets: matched,
      themes: matchThemes(title),
    })
  }
  return { rows, sources: [...sources.values()] }
}

async function saveRows(db: any, rows: Row[]): Promise<void> {
  const { data: saved, error } = await db.from('articles').upsert(rows.map((r) => r.article), { onConflict: 'url' }).select('id,url')
  if (error) throw error
  const idByUrl = new Map<string, string>((saved ?? []).map((s: any) => [s.url, s.id]))
  const aa = rows.flatMap((r) => r.assets.map((slug) => ({ article_id: idByUrl.get(r.article.url), asset_slug: slug }))).filter((x) => x.article_id)
  const at = rows.flatMap((r) => r.themes.map((theme_id) => ({ article_id: idByUrl.get(r.article.url), theme_id }))).filter((x) => x.article_id)
  if (aa.length) await db.from('article_assets').upsert(aa, { onConflict: 'article_id,asset_slug', ignoreDuplicates: true })
  if (at.length) await db.from('article_themes').upsert(at, { onConflict: 'article_id,theme_id', ignoreDuplicates: true })
}

async function runGdelt(db: any, assets: AssetRef[], ua: string): Promise<Record<string, unknown>> {
  const report: Record<string, unknown> = {}
  const stocks = assets.filter((a) => (a as any).kind !== 'forex')
  let total = 0
  for (const q of GDELT_QUERIES) {
    try {
      const res = await fetch(gdeltUrl(q.query), { headers: { 'User-Agent': ua } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { rows, sources } = gdeltRows(parseGdelt(await res.text()), stocks)
      if (rows.length) {
        const { error } = await db.from('sources').upsert(sources, { onConflict: 'id', ignoreDuplicates: true })
        if (error) throw error
        await saveRows(db, rows)
      }
      report[q.label] = rows.length
      total += rows.length
    } catch (e) {
      report[q.label] = `erro: ${(e as Error).message}`
    }
    await new Promise((r) => setTimeout(r, 5500)) // limite do GDELT: 1 pedido a cada 5 s
  }
  report.total = total
  return report
}

async function run(job = ''): Promise<Record<string, unknown>> {
  // @ts-ignore: carregado só no Deno
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2') // eslint-disable-line import/no-unresolved
  // @ts-ignore: Deno
  const env = Deno.env
  const db = createClient(env.get('SUPABASE_URL')!, env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const ua = userAgent(env.get('INGEST_CONTACT'))
  const { data: assetRows } = await db.from('assets').select('slug,symbol,name,aliases,kind,cik')
  const assets: AssetRef[] = (assetRows ?? []).map((a: any) => ({ ...a, aliases: a.aliases ?? [] }))
  if (job === 'gdelt') return { gdelt: await runGdelt(db, assets, ua) }
  const report: Record<string, unknown> = {}
  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, { headers: { 'User-Agent': ua, Accept: 'application/rss+xml, application/atom+xml, text/xml' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const rows = buildRows(parseFeed(await res.text()), feed, assets)
      if (rows.length === 0) { report[feed.url] = 0; continue }
      await saveRows(db, rows)
      report[feed.url] = rows.length
    } catch (e) {
      report[feed.url] = `erro: ${(e as Error).message}` // um feed a falhar não pára os outros
    }
  }
  // Relatórios 8-K. Empresas com CIK: feed global (4 páginas de 100, as mais recentes). Sem CIK: um pedido por empresa.
  // Pausa curta entre pedidos: a SEC permite até 10 por segundo.
  let filings = 0
  const failures: string[] = []
  const pause = () => new Promise((r) => setTimeout(r, 200))
  const stocks = (assetRows ?? []).filter((r: any) => r.kind === 'stock').map((a: any) => ({ ...a, aliases: a.aliases ?? [] }))
  if (stocks.some((a: any) => a.cik)) {
    for (const start of [0, 100, 200, 300]) {
      try {
        const res = await fetch(sec8kCurrentUrl(start), { headers: { 'User-Agent': ua, Accept: 'application/atom+xml' } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const rows = sec8kCurrentRows(await res.text(), stocks)
        if (rows.length) { await saveRows(db, rows); filings += rows.length }
      } catch (e) {
        failures.push(`global start=${start}: ${(e as Error).message}`)
      }
      await pause()
    }
  }
  for (const a of stocks.filter((x: any) => !x.cik).slice(0, 20)) {
    try {
      const res = await fetch(sec8kUrl(a.symbol), { headers: { 'User-Agent': ua, Accept: 'application/atom+xml' } })
      if (res.ok) {
        const rows = sec8kRows(await res.text(), a)
        if (rows.length) { await saveRows(db, rows); filings += rows.length }
      } else if (res.status !== 404) failures.push(`${a.symbol}: HTTP ${res.status}`)
    } catch (e) {
      failures.push(`${a.symbol}: ${(e as Error).message}`)
    }
    await pause()
  }
  report['sec-8k'] = failures.length ? { artigos: filings, falhas: failures } : filings
  try {
    const res = await fetch(BLS_ICS_URL, { headers: { 'User-Agent': ua } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const events = blsRows(await res.text())
    if (events.length) {
      const { error } = await db.from('calendar_events').upsert(events, { onConflict: 'id' })
      if (error) throw error
    }
    report[BLS_ICS_URL] = events.length
  } catch (e) {
    report[BLS_ICS_URL] = `erro: ${(e as Error).message}`
  }
  return report
}

// @ts-ignore: só existe no Deno
if (typeof Deno !== 'undefined') Deno.serve(async (req: Request) => new Response(JSON.stringify(await run(new URL(req.url).searchParams.get('job') ?? '')), { headers: { 'content-type': 'application/json' } }))
