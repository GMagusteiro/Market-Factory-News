import type { Asset } from './types';

export type Interest = 'stock' | 'forex' | 'both';
export const MIN_PICKS = 3;

export function assetsForInterest(assets: Asset[], interest: Interest): Asset[] {
  return interest === 'both' ? assets : assets.filter((a) => a.kind === interest);
}

export const canFinish = (picked: string[]) => new Set(picked).size >= MIN_PICKS;

/** Junta as escolhas às que já existem, sem duplicar e mantendo a ordem. */
export function mergePicks(existing: string[], picked: string[]): string[] {
  return [...new Set([...existing, ...picked])];
}
