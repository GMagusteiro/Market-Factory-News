// Edge Function "calendar-ics": devolve um calendário ICS (subscrição) com os eventos
// económicos das moedas da watchlist de uma conta. A conta é identificada por um token secreto
// no endereço (?token=...), porque os programas de calendário não enviam sessão.
// Publicar com "Verify JWT" DESLIGADO (docs/CALENDARIO_ICS.md).

export interface IcsEvent {
  id: string
  title: string
  country: string | null
  currency: string | null
  impact: 'low' | 'medium' | 'high'
  starts_at: string
  forecast?: string | null
  previous?: string | null
}

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isToken = (value: unknown): value is string => typeof value === 'string' && TOKEN_RE.test(value)

/** Escapa texto para ICS (RFC 5545 §3.3.11). */
export function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Dobra linhas a 75 octetos (UTF-8), sem partir carateres. Continuação começa com um espaço. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= 75) return line
  const out: string[] = []
  let current = ''
  let size = 0
  for (const char of line) {
    const bytes = encoder.encode(char).length
    const limit = out.length === 0 ? 75 : 74 // a linha de continuação gasta 1 octeto no espaço
    if (size + bytes > limit) {
      out.push(current)
      current = ''
      size = 0
    }
    current += char
    size += bytes
  }
  out.push(current)
  return out.join('\r\n ')
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

const IMPACT_LABEL = { high: 'High', medium: 'Medium', low: 'Low' } as const

/** Moedas das ativos da watchlist, sem repetições e por ordem. */
export function currenciesOf(assets: { currencies: string[] | null }[]): string[] {
  return [...new Set(assets.flatMap((a) => a.currencies ?? []))].sort()
}

/** Constrói o ficheiro .ics. Pura: recebe os eventos já filtrados e a hora atual. */
export function buildIcs(events: IcsEvent[], now: Date, currencies: string[] = []): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Market Factory News//Economic calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(currencies.length ? `Market Factory News (${currencies.join(', ')})` : 'Market Factory News')}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
  ]
  for (const e of [...events].sort((a, b) => a.starts_at.localeCompare(b.starts_at))) {
    const start = new Date(e.starts_at)
    if (Number.isNaN(start.getTime())) continue
    const end = new Date(start.getTime() + 15 * 60_000)
    const description = [
      `Impact: ${IMPACT_LABEL[e.impact]}`,
      e.country ? `Country: ${e.country}` : '',
      e.forecast ? `Forecast: ${e.forecast}` : '',
      e.previous ? `Previous: ${e.previous}` : '',
    ].filter(Boolean)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}@marketlens`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escapeText(`${e.impact === 'high' ? '● ' : ''}${e.title}${e.currency ? ` (${e.currency})` : ''}`)}`,
      `DESCRIPTION:${escapeText(description.join('\n'))}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

const WINDOW_BACK_DAYS = 7
const WINDOW_AHEAD_DAYS = 120

/** Lê token → conta → watchlist → moedas → eventos, e devolve o ICS (ou null se o token não existir). */
export async function ics(token: string, now = new Date()): Promise<string | null> {
  // @ts-ignore: carregado só no Deno
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2') // eslint-disable-line import/no-unresolved
  // @ts-ignore: só existe no Deno
  const env = Deno.env
  const db = createClient(env.get('SUPABASE_URL'), env.get('SUPABASE_SERVICE_ROLE_KEY'))

  const { data: feed } = await db.from('calendar_feeds').select('user_id').eq('token', token).maybeSingle()
  if (!feed) return null

  const { data: items, error: itemsError } = await db.from('watchlist_items').select('asset_slug').eq('user_id', feed.user_id)
  if (itemsError) throw new Error(`watchlist: ${itemsError.message}`)
  const slugs = (items ?? []).map((i: { asset_slug: string }) => i.asset_slug)
  const { data: assets, error: assetsError } = slugs.length
    ? await db.from('assets').select('currencies').in('slug', slugs)
    : { data: [], error: null }
  if (assetsError) throw new Error(`assets: ${assetsError.message}`)
  const currencies = currenciesOf(assets ?? [])
  if (!currencies.length) return buildIcs([], now)

  const from = new Date(now.getTime() - WINDOW_BACK_DAYS * 86_400_000).toISOString()
  const to = new Date(now.getTime() + WINDOW_AHEAD_DAYS * 86_400_000).toISOString()
  const { data: events, error: eventsError } = await db
    .from('calendar_events')
    .select('id,title,country,currency,impact,starts_at,forecast,previous')
    .in('currency', currencies)
    .gte('starts_at', from)
    .lte('starts_at', to)
    .order('starts_at')
  if (eventsError) throw new Error(`events: ${eventsError.message}`)
  return buildIcs(events ?? [], now, currencies)
}

export async function handle(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get('token')
  if (!isToken(token)) return new Response('Not found', { status: 404 })
  let body: string | null
  try {
    body = await ics(token)
  } catch (e) {
    return new Response(`Error: ${(e as Error).message}`, { status: 500 }) // mostra a causa em vez de um calendário vazio
  }
  if (body === null) return new Response('Not found', { status: 404 })
  return new Response(body, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'cache-control': 'private, no-cache',
      'content-disposition': 'inline; filename="marketlens.ics"',
    },
  })
}

// @ts-ignore: só existe no Deno
if (typeof Deno !== 'undefined') Deno.serve(handle)
