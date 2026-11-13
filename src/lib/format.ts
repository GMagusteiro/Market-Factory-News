// Fuso horário fixo para o HTML estático e o cliente produzirem o mesmo texto.
const TIME_ZONE = 'Europe/Lisbon';

const cache = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string, kind: 'dateTime' | 'day' | 'time'): Intl.DateTimeFormat {
  const key = `${locale}|${kind}`;
  let format = cache.get(key);
  if (!format) {
    const options: Intl.DateTimeFormatOptions =
      kind === 'dateTime'
        ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
        : kind === 'day'
          ? { weekday: 'long', day: 'numeric', month: 'long' }
          : { hour: '2-digit', minute: '2-digit' };
    format = new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, ...options });
    cache.set(key, format);
  }
  return format;
}

const dayKeyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const formatDateTime = (iso: string, locale = 'en-GB') =>
  formatter(locale, 'dateTime').format(new Date(iso));
export const formatDay = (iso: string, locale = 'en-GB') =>
  formatter(locale, 'day').format(new Date(iso));
export const formatTime = (iso: string, locale = 'en-GB') =>
  formatter(locale, 'time').format(new Date(iso));
/** Chave AAAA-MM-DD do dia (no fuso de Lisboa), para agrupar eventos. */
export const dayKey = (iso: string) => dayKeyFormat.format(new Date(iso));

/** "EUR e USD" / "EUR and USD" / "EUR y USD", conforme o idioma. */
export const joinList = (items: string[], locale = 'en-GB') =>
  new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(items);
