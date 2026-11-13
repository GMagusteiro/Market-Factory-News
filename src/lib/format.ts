import { DEFAULT_TIME_ZONE, isValidTimeZone } from './timezones';

// Começa em Lisboa para o HTML estático e o cliente produzirem o mesmo texto; depois segue a escolha da pessoa.
let timeZone = DEFAULT_TIME_ZONE;

export function setDisplayTimeZone(tz: string) {
  if (tz !== timeZone && isValidTimeZone(tz)) timeZone = tz;
}

const cache = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string, kind: 'dateTime' | 'day' | 'time'): Intl.DateTimeFormat {
  const key = `${timeZone}|${locale}|${kind}`;
  let format = cache.get(key);
  if (!format) {
    const options: Intl.DateTimeFormatOptions =
      kind === 'dateTime'
        ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
        : kind === 'day'
          ? { weekday: 'long', day: 'numeric', month: 'long' }
          : { hour: '2-digit', minute: '2-digit' };
    format = new Intl.DateTimeFormat(locale, { timeZone, ...options });
    cache.set(key, format);
  }
  return format;
}

const dayKeyFormats = new Map<string, Intl.DateTimeFormat>();
function dayKeyFormat(): Intl.DateTimeFormat {
  let format = dayKeyFormats.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
    dayKeyFormats.set(timeZone, format);
  }
  return format;
}

export const formatDateTime = (iso: string, locale = 'en-GB') =>
  formatter(locale, 'dateTime').format(new Date(iso));
export const formatDay = (iso: string, locale = 'en-GB') =>
  formatter(locale, 'day').format(new Date(iso));
export const formatTime = (iso: string, locale = 'en-GB') =>
  formatter(locale, 'time').format(new Date(iso));
/** Chave AAAA-MM-DD do dia (no fuso escolhido), para agrupar eventos. */
export const dayKey = (iso: string) => dayKeyFormat().format(new Date(iso));

/** "EUR e USD" / "EUR and USD" / "EUR y USD", conforme o idioma. */
export const joinList = (items: string[], locale = 'en-GB') =>
  new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(items);
