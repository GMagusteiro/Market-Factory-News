export type AssetKind = 'stock' | 'forex';

export interface Asset {
  /** Usado no URL, ex.: "nvda" ou "eur-usd". */
  slug: string;
  symbol: string;
  name: string;
  kind: AssetKind;
  /** Moedas relevantes para o calendário económico (ex.: ["EUR", "USD"]). */
  currencies: string[];
  /** Outros nomes pelos quais o ativo é procurado. */
  aliases: string[];
}

export type ArticleType = 'news' | 'opinion' | 'official';

export interface Source {
  id: string;
  name: string;
  /** Tipo habitual de conteúdo desta fonte. */
  type: ArticleType;
}

export interface Article {
  id: string;
  assetSlug: string;
  title: string;
  sourceId: string;
  type: ArticleType;
  /** ISO 8601 em UTC. */
  publishedAt: string;
  url: string;
}

export type Impact = 'high' | 'medium' | 'low';

export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO 8601 em UTC. */
  datetime: string;
  currency: string;
  country: string;
  impact: Impact;
}
