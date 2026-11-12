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
  /** Temas a que o ativo pertence (slugs). Uma notícia do tema é relevante para o ativo. */
  themes: string[];
}

/** Tema que liga notícias a ativos sem estes serem nomeados (ex.: terras raras). */
export interface Theme {
  slug: string;
  name: string;
  description: string;
}

export type ArticleType = 'news' | 'opinion' | 'official';

export interface Source {
  id: string;
  name: string;
  /** Tipo habitual de conteúdo desta fonte. */
  type: ArticleType;
  /** Fiabilidade: 1 = mais fiável (agências, comunicados oficiais), 3 = menos (opinião). */
  tier: 1 | 2 | 3;
}

export interface Article {
  id: string;
  /** Ativos mencionados diretamente. */
  assetSlugs: string[];
  /** Temas da notícia (slugs). */
  themes: string[];
  /** Artigos que contam o mesmo acontecimento partilham o mesmo storyId. */
  storyId: string;
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

/** Ligação de uma notícia a um ativo: menção direta ou apenas pelo tema. */
export type Relation = 'direct' | 'theme';

/** Notícia vista a partir de um ativo (ou conjunto de ativos). */
export interface NewsEntry {
  article: Article;
  relation: Relation;
  /** Tema que fez a ligação, quando a relação é "theme". */
  theme?: Theme;
}

/** Conjunto de artigos que contam o mesmo acontecimento. */
export interface Story {
  id: string;
  /** Título do artigo principal (o da fonte mais fiável). */
  title: string;
  leadArticle: Article;
  articles: Article[];
  sourceCount: number;
  themes: Theme[];
  affected: { asset: Asset; relation: Relation }[];
  /** 0 a 100. */
  score: number;
  /** Data do artigo mais recente. */
  updatedAt: string;
}
