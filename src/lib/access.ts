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

export function canSeeCalendarHistory(tier: Tier, authEnabled: boolean): boolean {
  return !authEnabled || tier !== 'guest';
}

/** Dias de calendário à frente: 7 para visitantes, 14 com conta. */
export function calendarAheadDays(tier: Tier, authEnabled: boolean): number {
  return !authEnabled || tier !== 'guest' ? 14 : 7;
}

/** Junta a watchlist do dispositivo com a da conta, sem repetidos, pela ordem da conta primeiro. */
export function mergeWatchlists(local: string[], remote: string[]): string[] {
  return [...new Set([...remote, ...local])];
}
