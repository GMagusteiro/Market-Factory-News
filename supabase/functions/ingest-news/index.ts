// Edge Function: recolhe feeds RSS/Atom oficiais e guarda título, fonte, data, link e (só em fontes oficiais) um excerto curto.
// Ficheiro único para poder ser colado no painel do Supabase. A chave de serviço só existe aqui (variáveis do servidor).
// A SEC exige contacto no User-Agent: definir o segredo INGEST_CONTACT (email) nas variáveis da função.

export type FeedConfig = { sourceId: string; url: string; type: 'news' | 'opinion' | 'official' }
export type ParsedItem = { title: string; url: string; publishedAt: string; description: string }
export type AssetRef = { slug: string; symbol: string; name: string; aliases: string[] }

export function userAgent(contact: string | undefined): string {
  return `MarketLens/1.0 (${contact || 'sem-contacto'})`
}

export const FEEDS: FeedConfig[] = [
  { sourceId: 'fed', url: 'https://www.federalreserve.gov/feeds/press_all.xml', type: 'official' },
  { sourceId: 'fed', url: 'https://www.federalreserve.gov/feeds/press_monetary.xml', type: 'official' },
  { sourceId: 'bce', url: 'https://www.ecb.europa.eu/rss/press.html', type: 'official' },
  { sourceId: 'sec', url: 'https://www.sec.gov/news/pressreleases.rss', type: 'official' },
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

export function matchAssets(text: string, assets: AssetRef[]): string[] {
  const hits: string[] = []
  for (const a of assets) {
    const names = [a.name, ...a.aliases].filter((n) => n.length >= 3)
    const byName = names.some((n) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(n)}($|[^\\p{L}\\p{N}])`, 'iu').test(text))
    // símbolo só em maiúsculas e com 3+ letras, para evitar falsos positivos
    const bySymbol = a.symbol.length >= 3 && new RegExp(`(^|[^A-Za-z0-9])${escapeRe(a.symbol)}($|[^A-Za-z0-9])`).test(text)
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

async function run(): Promise<Record<string, unknown>> {
  // @ts-ignore: carregado só no Deno
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2') // eslint-disable-line import/no-unresolved
  // @ts-ignore: Deno
  const env = Deno.env
  const db = createClient(env.get('SUPABASE_URL')!, env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const ua = userAgent(env.get('INGEST_CONTACT'))
  const { data: assetRows } = await db.from('assets').select('slug,symbol,name,aliases')
  const assets: AssetRef[] = (assetRows ?? []).map((a: any) => ({ ...a, aliases: a.aliases ?? [] }))
  const report: Record<string, unknown> = {}
  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, { headers: { 'User-Agent': ua, Accept: 'application/rss+xml, application/atom+xml, text/xml' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const rows = buildRows(parseFeed(await res.text()), feed, assets)
      if (rows.length === 0) { report[feed.url] = 0; continue }
      const { data: saved, error } = await db.from('articles').upsert(rows.map((r) => r.article), { onConflict: 'url' }).select('id,url')
      if (error) throw error
      const idByUrl = new Map<string, string>((saved ?? []).map((s: any) => [s.url, s.id]))
      const aa = rows.flatMap((r) => r.assets.map((slug) => ({ article_id: idByUrl.get(r.article.url), asset_slug: slug }))).filter((x) => x.article_id)
      const at = rows.flatMap((r) => r.themes.map((theme_id) => ({ article_id: idByUrl.get(r.article.url), theme_id }))).filter((x) => x.article_id)
      if (aa.length) await db.from('article_assets').upsert(aa, { onConflict: 'article_id,asset_slug', ignoreDuplicates: true })
      if (at.length) await db.from('article_themes').upsert(at, { onConflict: 'article_id,theme_id', ignoreDuplicates: true })
      report[feed.url] = rows.length
    } catch (e) {
      report[feed.url] = `erro: ${(e as Error).message}` // um feed a falhar não pára os outros
    }
  }
  return report
}

// @ts-ignore: só existe no Deno
if (typeof Deno !== 'undefined') Deno.serve(async () => new Response(JSON.stringify(await run()), { headers: { 'content-type': 'application/json' } }))
