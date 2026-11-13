const PATH = '/functions/v1/calendar-ics';

/** Endereço da subscrição (https). Devolve null se faltar a base ou o token. */
export function feedUrl(supabaseUrl: string | undefined, token: string | null): string | null {
  if (!supabaseUrl || !token) return null;
  return `${supabaseUrl.replace(/\/+$/, '')}${PATH}?token=${encodeURIComponent(token)}`;
}

/** Mesmo endereço com webcal://, que abre diretamente o programa de calendário. */
export const webcalUrl = (https: string): string => https.replace(/^https?:\/\//, 'webcal://');

/** Endereço para adicionar ao Google Calendar. */
export const googleAddUrl = (https: string): string =>
  `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl(https))}`;
