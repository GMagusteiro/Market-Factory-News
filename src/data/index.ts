import type { Article, ArticleType, Asset, CalendarEvent, Source, Theme } from '@/lib/types';

import assetsJson from './assets.json';
import calendarJson from './calendar.json';
import sourcesJson from './sources.json';
import themesJson from './themes.json';

/**
 * DADOS DE EXEMPLO (Fase 1 e 2). Nada aqui é notícia real: as fontes e os
 * títulos são fictícios e servem só para testar o fluxo. Mais tarde isto passa
 * a vir do Supabase.
 *
 * "Agora" é fixo para os filtros de período darem sempre o mesmo resultado.
 * Com dados reais passa a ser a hora real.
 */
export const SAMPLE_NOW = new Date('2026-11-12T12:00:00Z');

export const assets = assetsJson as Asset[];
export const sources = sourcesJson as Source[];
export const themes = themesJson as Theme[];
export const calendarEvents = (calendarJson as CalendarEvent[])
  .slice()
  .sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));

export const getAsset = (slug: string) => assets.find((asset) => asset.slug === slug);
export const getSource = (id: string) => sources.find((source) => source.id === id);
export const getTheme = (slug: string) => themes.find((theme) => theme.slug === slug);

const hoursBefore = (hours: number) =>
  new Date(SAMPLE_NOW.getTime() - hours * 3_600_000).toISOString();

// ---------------------------------------------------------------------------
// Artigos por ativo: uma fonte, sem tema (notícias "normais" de cada ativo).
// ---------------------------------------------------------------------------

interface Template {
  type: ArticleType;
  sourceId: string;
  /** Horas antes de "agora". */
  hoursAgo: number;
  title: (name: string) => string;
}

const STOCK_TEMPLATES: Template[] = [
  { type: 'news', sourceId: 'agencia-exemplo', hoursAgo: 3, title: (n) => `${n}: ponto de situação da ação (artigo de exemplo)` },
  { type: 'news', sourceId: 'diario-exemplo', hoursAgo: 20, title: (n) => `Analistas atualizam expectativas para ${n} (artigo de exemplo)` },
  { type: 'opinion', sourceId: 'opiniao-exemplo', hoursAgo: 50, title: (n) => `Opinião: vale a pena acompanhar ${n}? (exemplo)` },
  { type: 'official', sourceId: 'ri-exemplo', hoursAgo: 100, title: (n) => `${n} publica comunicado aos investidores (exemplo)` },
  { type: 'news', sourceId: 'agencia-exemplo', hoursAgo: 190, title: (n) => `${n} e o setor: o que mudou esta semana (artigo de exemplo)` },
  { type: 'opinion', sourceId: 'opiniao-exemplo', hoursAgo: 300, title: (n) => `Opinião: o risco de concentração em ${n} (exemplo)` },
  { type: 'official', sourceId: 'ri-exemplo', hoursAgo: 480, title: (n) => `${n}: calendário de resultados e eventos (exemplo)` },
  { type: 'news', sourceId: 'diario-exemplo', hoursAgo: 700, title: (n) => `${n}: perspetivas para o próximo trimestre (artigo de exemplo)` },
];

const FOREX_TEMPLATES: Template[] = [
  { type: 'news', sourceId: 'agencia-exemplo', hoursAgo: 3, title: (n) => `${n}: sessão de hoje e fatores em foco (artigo de exemplo)` },
  { type: 'news', sourceId: 'diario-exemplo', hoursAgo: 20, title: (n) => `${n}: o que esperar dos dados macro desta semana (exemplo)` },
  { type: 'opinion', sourceId: 'opiniao-exemplo', hoursAgo: 50, title: (n) => `Opinião: tendência de médio prazo em ${n} (exemplo)` },
  { type: 'official', sourceId: 'banco-central-exemplo', hoursAgo: 100, title: (n) => `Banco central: comunicado relevante para ${n} (exemplo)` },
  { type: 'news', sourceId: 'agencia-exemplo', hoursAgo: 190, title: (n) => `${n}: semana de movimentos e suportes em análise (exemplo)` },
  { type: 'opinion', sourceId: 'opiniao-exemplo', hoursAgo: 300, title: (n) => `Opinião: o que move ${n} no longo prazo (exemplo)` },
  { type: 'official', sourceId: 'banco-central-exemplo', hoursAgo: 480, title: (n) => `Banco central: atas e calendário para ${n} (exemplo)` },
  { type: 'news', sourceId: 'diario-exemplo', hoursAgo: 700, title: (n) => `${n}: balanço do mês (artigo de exemplo)` },
];

function buildAssetArticles(): Article[] {
  const result: Article[] = [];
  assets.forEach((asset, assetIndex) => {
    const templates = asset.kind === 'forex' ? FOREX_TEMPLATES : STOCK_TEMPLATES;
    templates.forEach((template, templateIndex) => {
      // Desvio determinístico para os artigos não saírem todos à mesma hora.
      const jitter = (assetIndex * 7 + templateIndex * 3) % 11;
      const id = `${asset.slug}-${templateIndex + 1}`;
      result.push({
        id,
        assetSlugs: [asset.slug],
        themes: [],
        storyId: id,
        title: template.title(asset.name),
        sourceId: template.sourceId,
        type: template.type,
        publishedAt: hoursBefore(template.hoursAgo + jitter),
        url: `https://example.com/exemplo/${id}`,
      });
    });
  });
  return result;
}

// ---------------------------------------------------------------------------
// Histórias por tema: várias fontes a contar o mesmo acontecimento, sem
// nomear as empresas afetadas (o caso dos ímanes e das terras raras).
// ---------------------------------------------------------------------------

interface StoryTemplate {
  id: string;
  themes: string[];
  items: { sourceId: string; type: ArticleType; hoursAgo: number; title: string }[];
}

const STORIES: StoryTemplate[] = [
  {
    id: 'ima',
    themes: ['terras-raras'],
    items: [
      { sourceId: 'agencia-exemplo', type: 'news', hoursAgo: 5, title: 'Governo anuncia medidas para a cadeia de abastecimento de ímanes (notícia de exemplo)' },
      { sourceId: 'diario-exemplo', type: 'news', hoursAgo: 6, title: 'Ímanes e terras raras: o que muda com o novo plano do governo (exemplo)' },
      { sourceId: 'opiniao-exemplo', type: 'opinion', hoursAgo: 9, title: 'Opinião: porque é que os ímanes passaram a ser estratégicos (exemplo)' },
    ],
  },
  {
    id: 'chips',
    themes: ['semicondutores-ia'],
    items: [
      { sourceId: 'agencia-exemplo', type: 'news', hoursAgo: 11, title: 'Reguladores debatem novas regras para chips de inteligência artificial (notícia de exemplo)' },
      { sourceId: 'diario-exemplo', type: 'news', hoursAgo: 13, title: 'Chips de IA: o que está em cima da mesa dos reguladores (exemplo)' },
    ],
  },
  {
    id: 'juros',
    themes: ['taxas-de-juro'],
    items: [
      { sourceId: 'banco-central-exemplo', type: 'official', hoursAgo: 8, title: 'Banco central divulga comunicado sobre o calendário de decisões de taxas (exemplo)' },
      { sourceId: 'agencia-exemplo', type: 'news', hoursAgo: 9, title: 'Banco central sinaliza calendário de decisões de taxas de juro (notícia de exemplo)' },
      { sourceId: 'diario-exemplo', type: 'news', hoursAgo: 10, title: 'Taxas de juro: o que esperar das próximas decisões (exemplo)' },
      { sourceId: 'opiniao-exemplo', type: 'opinion', hoursAgo: 14, title: 'Opinião: o mercado já está a antecipar o banco central? (exemplo)' },
    ],
  },
  {
    id: 'energia',
    themes: ['energia'],
    items: [
      { sourceId: 'agencia-exemplo', type: 'news', hoursAgo: 40, title: 'Preços da energia em foco após reunião de produtores (notícia de exemplo)' },
      { sourceId: 'diario-exemplo', type: 'news', hoursAgo: 42, title: 'Energia: produtores e o impacto nos preços (exemplo)' },
    ],
  },
];

function buildStoryArticles(): Article[] {
  return STORIES.flatMap((story) =>
    story.items.map((item, index) => {
      const id = `story-${story.id}-${index + 1}`;
      return {
        id,
        assetSlugs: [],
        themes: story.themes,
        storyId: `story-${story.id}`,
        title: item.title,
        sourceId: item.sourceId,
        type: item.type,
        publishedAt: hoursBefore(item.hoursAgo),
        url: `https://example.com/exemplo/${id}`,
      };
    }),
  );
}

export const articles: Article[] = [...buildAssetArticles(), ...buildStoryArticles()];
