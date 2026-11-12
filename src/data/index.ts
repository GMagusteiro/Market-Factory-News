import type { Article, ArticleType, Asset, CalendarEvent, Source } from '@/lib/types';

import assetsJson from './assets.json';
import calendarJson from './calendar.json';
import sourcesJson from './sources.json';

/**
 * DADOS DE EXEMPLO (Fase 1). Nada aqui é notícia real: as fontes e os títulos
 * são fictícios e servem só para testar o fluxo. Na Fase 2 isto passa a vir
 * do Supabase.
 *
 * "Agora" é fixo para os filtros de período darem sempre o mesmo resultado.
 * Na Fase 2 passa a ser a hora real.
 */
export const SAMPLE_NOW = new Date('2026-11-12T12:00:00Z');

export const assets = assetsJson as Asset[];
export const sources = sourcesJson as Source[];
export const calendarEvents = (calendarJson as CalendarEvent[])
  .slice()
  .sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));

export const getAsset = (slug: string) => assets.find((asset) => asset.slug === slug);
export const getSource = (id: string) => sources.find((source) => source.id === id);

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

function buildArticles(): Article[] {
  const result: Article[] = [];
  assets.forEach((asset, assetIndex) => {
    const templates = asset.kind === 'forex' ? FOREX_TEMPLATES : STOCK_TEMPLATES;
    templates.forEach((template, templateIndex) => {
      // Desvio determinístico para os artigos não saírem todos à mesma hora.
      const jitter = (assetIndex * 7 + templateIndex * 3) % 11;
      const published = new Date(SAMPLE_NOW.getTime() - (template.hoursAgo + jitter) * 3_600_000);
      const id = `${asset.slug}-${templateIndex + 1}`;
      result.push({
        id,
        assetSlug: asset.slug,
        title: template.title(asset.name),
        sourceId: template.sourceId,
        type: template.type,
        publishedAt: published.toISOString(),
        url: `https://example.com/exemplo/${id}`,
      });
    });
  });
  return result;
}

export const articles: Article[] = buildArticles();
