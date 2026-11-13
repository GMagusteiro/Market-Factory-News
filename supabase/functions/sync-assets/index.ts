// Edge Function "sync-assets": acrescenta as maiores empresas cotadas nos EUA (lista oficial da SEC) à tabela assets.
// Empresas já existentes (mesmo símbolo) só recebem o CIK; nome, aliases e temas ficam como estão.
// Correr uma vez à mão (Invoke), com ?limit=500 (por omissão 500, máximo 1000).

export type SecTicker = { cik_str: number; ticker: string; title: string }
export type NewAsset = { slug: string; symbol: string; name: string; kind: 'stock'; currencies: string[]; aliases: string[]; cik: string }

const SUFFIX = /\b(inc|corp|corporation|co|company|ltd|limited|plc|holdings?|group|llc|lp|sa|nv|ag|the)\b\.?/gi

const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s\-\/(])([a-z])/g, (_, a, b) => a + b.toUpperCase())

/** "NVIDIA CORP" -> "Nvidia"; mantém o nome legal como alias. Siglas curtas (IBM, AMD) ficam em maiúsculas. */
export function cleanName(title: string): { name: string; alias: string } {
  const legal = title.replace(/\s+/g, ' ').trim()
  const base = legal.replace(/\/[A-Z]{2,3}\/?/g, '').replace(SUFFIX, '').replace(/[,.]+/g, ' ').replace(/\s+/g, ' ').trim()
  const name = base.length <= 4 && base === base.toUpperCase() ? base : titleCase(base)
  return { name: name || titleCase(legal), alias: titleCase(legal) }
}

/** Primeiras `limit` entradas válidas (a SEC ordena por dimensão), sem símbolos repetidos nem classes de ações (BRK-B fica). */
export function toAssets(data: Record<string, SecTicker>, limit = 500): NewAsset[] {
  const out: NewAsset[] = []
  const seen = new Set<string>()
  for (const key of Object.keys(data).sort((a, b) => Number(a) - Number(b))) {
    const t = data[key]
    const symbol = String(t.ticker ?? '').toUpperCase()
    if (!/^[A-Z][A-Z0-9.\-]{0,5}$/.test(symbol) || seen.has(symbol) || !t.title) continue
    seen.add(symbol)
    const { name, alias } = cleanName(t.title)
    out.push({
      slug: symbol.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      symbol,
      name,
      kind: 'stock',
      currencies: ['USD'],
      aliases: alias.toLowerCase() === name.toLowerCase() ? [] : [alias],
      cik: String(t.cik_str),
    })
    if (out.length >= limit) break
  }
  return out
}

async function run(limit: number): Promise<Record<string, unknown>> {
  // @ts-ignore: carregado só no Deno
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2') // eslint-disable-line import/no-unresolved
  // @ts-ignore: Deno
  const env = Deno.env
  const db = createClient(env.get('SUPABASE_URL')!, env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const ua = `Market Factory News/1.0 (${env.get('INGEST_CONTACT') || 'sem-contacto'})`
  const res = await fetch('https://www.sec.gov/files/company_tickers.json', { headers: { 'User-Agent': ua } })
  if (!res.ok) return { erro: `SEC HTTP ${res.status}` }
  const wanted = toAssets(await res.json(), limit)

  const { data: existing } = await db.from('assets').select('slug,symbol')
  const bySymbol = new Map<string, string>((existing ?? []).map((a: { slug: string; symbol: string }) => [a.symbol.toUpperCase(), a.slug]))
  const fresh = wanted.filter((a) => !bySymbol.has(a.symbol))
  const known = wanted.filter((a) => bySymbol.has(a.symbol))

  let inserted = 0
  for (let i = 0; i < fresh.length; i += 200) {
    const { error } = await db.from('assets').upsert(fresh.slice(i, i + 200), { onConflict: 'slug', ignoreDuplicates: true })
    if (error) return { erro: error.message, inseridas: inserted }
    inserted += Math.min(200, fresh.length - i)
  }
  for (const a of known) await db.from('assets').update({ cik: a.cik }).eq('slug', bySymbol.get(a.symbol)!)
  return { lidas: wanted.length, novas: inserted, cik_atualizado: known.length }
}

// @ts-ignore: só existe no Deno
if (typeof Deno !== 'undefined') Deno.serve(async (req: Request) => {
  const limit = Math.min(1000, Math.max(1, Number(new URL(req.url).searchParams.get('limit')) || 500))
  return new Response(JSON.stringify(await run(limit)), { headers: { 'content-type': 'application/json' } })
})
