import type { ArticleType, Impact } from './types';

// Fuso horário fixo para o HTML estático e o cliente produzirem o mesmo texto.
const TIME_ZONE = 'Europe/Lisbon';

const dateTimeFormat = new Intl.DateTimeFormat('pt-PT', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const dayFormat = new Intl.DateTimeFormat('pt-PT', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const timeFormat = new Intl.DateTimeFormat('pt-PT', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});

const dayKeyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));
export const formatDay = (iso: string) => dayFormat.format(new Date(iso));
export const formatTime = (iso: string) => timeFormat.format(new Date(iso));
/** Chave AAAA-MM-DD do dia (no fuso de Lisboa), para agrupar eventos. */
export const dayKey = (iso: string) => dayKeyFormat.format(new Date(iso));

export const ARTICLE_TYPE_LABEL: Record<ArticleType, string> = {
  news: 'Notícia',
  opinion: 'Opinião',
  official: 'Comunicado oficial',
};

export const IMPACT_LABEL: Record<Impact, string> = {
  high: 'Impacto alto',
  medium: 'Impacto médio',
  low: 'Impacto baixo',
};
