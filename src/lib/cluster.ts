import type { Article } from './types';

/**
 * Agrupa em histórias os artigos que contam o mesmo acontecimento mas não têm história atribuída
 * (as fontes reais não dizem a que história pertencem). Critério: títulos parecidos (palavras em comum)
 * publicados com poucas horas de diferença. Sem rede nem IA: só comparação de palavras.
 */
const STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'its', 'are', 'was', 'has', 'have', 'will', 'new', 'says', 'said',
  'des', 'las', 'los', 'del', 'por', 'para', 'con', 'una', 'que', 'les', 'une', 'dos', 'das', 'uma', 'com', 'sec', 'filing',
]);
// Os relatórios 8-K têm todos o mesmo texto base ("SEC 8-K filing on ..."): agrupá-los juntaria empresas diferentes.
const BOILERPLATE = /SEC 8-K filing/i;
const WINDOW_MS = 48 * 60 * 60 * 1000;
const MIN_SHARED = 3;
const MIN_SIMILARITY = 0.55;

export function titleTokens(title: string): Set<string> {
  const words = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOP.has(w));
  return new Set(words);
}

export function similar(a: Set<string>, b: Set<string>): boolean {
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  if (shared < MIN_SHARED) return false;
  // sobreposição relativa ao título mais curto, para tolerar um título com mais palavras que o outro
  return shared / Math.min(a.size, b.size) >= MIN_SIMILARITY;
}

/** Devolve os artigos com `storyId` partilhado quando os títulos são parecidos. Não altera os restantes. */
export function clusterArticles(articles: Article[], eligible: (a: Article) => boolean = (a) => a.storyId === a.id): Article[] {
  const ordered = articles
    .map((a, index) => ({ a, index, time: Date.parse(a.publishedAt), tokens: titleTokens(a.title) }))
    .sort((x, y) => x.time - y.time);
  const clusters: { id: string; tokens: Set<string>; last: number }[] = [];
  const storyOf = new Map<number, string>();

  for (const item of ordered) {
    if (!eligible(item.a)) continue; // já tem história atribuída
    if (BOILERPLATE.test(item.a.title)) { storyOf.set(item.index, item.a.id); continue; } // títulos-modelo parecem iguais sem o serem
    const hit = clusters.find((c) => item.time - c.last <= WINDOW_MS && similar(item.tokens, c.tokens));
    if (hit) {
      storyOf.set(item.index, hit.id);
      hit.last = item.time;
      for (const t of item.tokens) hit.tokens.add(t);
    } else {
      clusters.push({ id: item.a.id, tokens: new Set(item.tokens), last: item.time });
      storyOf.set(item.index, item.a.id);
    }
  }
  return articles.map((a, i) => (storyOf.has(i) ? { ...a, storyId: storyOf.get(i)! } : a));
}
