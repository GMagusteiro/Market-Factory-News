import { getDataset } from '@/data';

import type { Asset } from './types';

/** Minúsculas e sem acentos, para "jeronimo" encontrar "Jerónimo". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function score(asset: Asset, query: string): number {
  const symbol = normalize(asset.symbol);
  const symbolCompact = symbol.replace(/\s/g, '');
  const name = normalize(asset.name);
  const aliases = asset.aliases.map(normalize);

  if (symbol === query || symbolCompact === query.replace(/\s/g, '')) return 100;
  if (symbolCompact.startsWith(query.replace(/\s/g, ''))) return 80;
  if (name.startsWith(query)) return 70;
  if (aliases.some((alias) => alias.startsWith(query))) return 60;
  if (name.includes(query)) return 40;
  if (aliases.some((alias) => alias.includes(query))) return 30;
  return 0;
}

/** Pesquisa ativos por símbolo, nome ou alias. Devolve os melhores resultados primeiro. */
export function searchAssets(rawQuery: string, limit = 8, list: Asset[] = getDataset().assets): Asset[] {
  const query = normalize(rawQuery);
  if (!query) return [];
  return list
    .map((asset) => ({ asset, points: score(asset, query) }))
    .filter((item) => item.points > 0)
    .sort((a, b) => b.points - a.points || a.asset.name.localeCompare(b.asset.name))
    .slice(0, limit)
    .map((item) => item.asset);
}
