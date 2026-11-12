export type PeriodKey = '24h' | '7d' | '30d' | 'custom';

export const PERIOD_KEYS: PeriodKey[] = ['24h', '7d', '30d', 'custom'];

export interface DateRange {
  start: Date;
  end: Date;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Lê uma data no formato AAAA-MM-DD (UTC). Devolve null se for inválida. */
export function parseDay(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

/** Formata uma data como AAAA-MM-DD (UTC). */
export function toDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Converte a escolha do utilizador num intervalo de datas.
 * `now` é passado por parâmetro (nesta fase vem dos dados de exemplo).
 * Devolve null se o período personalizado for inválido.
 */
export function resolveRange(
  key: PeriodKey,
  from: string,
  to: string,
  now: Date,
): DateRange | null {
  switch (key) {
    case '24h':
      return { start: new Date(now.getTime() - DAY), end: now };
    case '7d':
      return { start: new Date(now.getTime() - 7 * DAY), end: now };
    case '30d':
      return { start: new Date(now.getTime() - 30 * DAY), end: now };
    case 'custom': {
      const start = parseDay(from);
      const end = parseDay(to);
      if (!start || !end || start.getTime() > end.getTime()) return null;
      // O dia final inclui-se por inteiro.
      return { start, end: new Date(end.getTime() + DAY - 1) };
    }
  }
}

export function inRange(iso: string, range: DateRange): boolean {
  const time = Date.parse(iso);
  return time >= range.start.getTime() && time <= range.end.getTime();
}
