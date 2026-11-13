import type { PeriodKey } from './period';

/** Nível de acesso: visitante (sem registo), conta gratuita ou premium (atribuído pelo Gonçalo). */
export type Tier = 'guest' | 'free' | 'premium';

/** Períodos que um visitante pode usar. 30 dias e personalizado exigem conta. */
const GUEST_PERIODS: PeriodKey[] = ['24h', '7d'];

/**
 * O registo só é exigido quando a autenticação está ativa (Supabase configurado);
 * sem ela (desenvolvimento local) tudo fica aberto.
 */
export function canUsePeriod(key: PeriodKey, tier: Tier, authEnabled: boolean): boolean {
  if (!authEnabled || tier !== 'guest') return true;
  return GUEST_PERIODS.includes(key);
}

/** Calendário aberto a todos (decisão do Gonçalo, 2026-11-13): 60 dias à frente e 14 dias de histórico, com ou sem conta. */
export const CALENDAR_AHEAD_DAYS = 60;

/** Junta a watchlist do dispositivo com a da conta, sem repetidos, pela ordem da conta primeiro. */
export function mergeWatchlists(local: string[], remote: string[]): string[] {
  return [...new Set([...remote, ...local])];
}
