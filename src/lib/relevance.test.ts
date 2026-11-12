import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SAMPLE_NOW, getAsset } from '../data';
import { resolveRange } from './period';
import { buildStories, scoreStory, topStories } from './relevance';
import { newsForAsset } from './news';

test('pontuação: máximo é 100 e mínimo não é negativo', () => {
  assert.equal(scoreStory({ ageHours: 0, sourceCount: 5, bestTier: 1, affectedCount: 6 }), 100);
  assert.ok(scoreStory({ ageHours: 500, sourceCount: 1, bestTier: 3, affectedCount: 0 }) >= 0);
});

test('pontuação: mais fontes, fonte mais fiável e notícia mais recente pontuam mais', () => {
  const base = { ageHours: 10, sourceCount: 2, bestTier: 2 as const, affectedCount: 2 };
  const score = scoreStory(base);
  assert.ok(scoreStory({ ...base, sourceCount: 4 }) > score);
  assert.ok(scoreStory({ ...base, bestTier: 1 }) > score);
  assert.ok(scoreStory({ ...base, ageHours: 2 }) > score);
  assert.ok(scoreStory({ ...base, affectedCount: 5 }) > score);
});

test('pontuação: a recência decai para metade a cada 24 horas', () => {
  const only = (ageHours: number) =>
    scoreStory({ ageHours, sourceCount: 0, bestTier: 3, affectedCount: 0 });
  // Só conta a recência (35%) mais a fiabilidade mínima (20% * 1/3).
  const floor = scoreStory({ ageHours: 100000, sourceCount: 0, bestTier: 3, affectedCount: 0 });
  assert.ok(Math.abs((only(24) - floor) * 2 - (only(0) - floor)) <= 1);
});

test('histórias: artigos com o mesmo storyId ficam juntos e a fonte mais fiável lidera', () => {
  const ima = buildStories(SAMPLE_NOW).find((story) => story.id === 'story-ima');
  assert.ok(ima);
  assert.equal(ima.articles.length, 3);
  assert.equal(ima.sourceCount, 3);
  assert.equal(ima.leadArticle.sourceId, 'agencia-exemplo');
  assert.deepEqual(ima.themes.map((theme) => theme.slug), ['terras-raras']);
});

test('ligação por tema: a história dos ímanes afeta empresas de terras raras sem as nomear', () => {
  const ima = buildStories(SAMPLE_NOW).find((story) => story.id === 'story-ima');
  assert.ok(ima);
  assert.deepEqual(ima.affected.map((a) => a.asset.slug).sort(), ['lyc', 'mp']);
  assert.ok(ima.affected.every((a) => a.relation === 'theme'));
});

test('em destaque: só histórias recentes com várias fontes, ordenadas por relevância', () => {
  const top = topStories(SAMPLE_NOW);
  const ids = top.map((story) => story.id);
  assert.deepEqual(ids, ['story-juros', 'story-ima', 'story-chips']);
  assert.ok(!ids.includes('story-energia'), 'história com mais de 24h fica de fora');
  assert.ok(top.every((story) => story.sourceCount >= 2), 'nada de histórias de uma só fonte');
  for (let i = 1; i < top.length; i++) assert.ok(top[i - 1].score >= top[i].score);
});

test('notícias do ativo incluem as ligadas por tema, marcadas como tal', () => {
  const mp = getAsset('mp');
  const range = resolveRange('7d', '', '', SAMPLE_NOW);
  assert.ok(mp && range);

  const entries = newsForAsset(mp, range);
  const themed = entries.filter((entry) => entry.relation === 'theme');
  const direct = entries.filter((entry) => entry.relation === 'direct');

  assert.equal(themed.length, 3, 'as 3 notícias da história dos ímanes');
  assert.ok(themed.every((entry) => entry.theme?.slug === 'terras-raras'));
  assert.ok(direct.length > 0, 'as notícias normais da empresa continuam lá');
});

test('ativos sem tema não recebem notícias de temas', () => {
  const apple = getAsset('aapl');
  const range = resolveRange('30d', '', '', SAMPLE_NOW);
  assert.ok(apple && range);
  assert.ok(newsForAsset(apple, range).every((entry) => entry.relation === 'direct'));
});

test('notícias do ativo vêm ordenadas das mais recentes para as mais antigas', () => {
  const nvda = getAsset('nvda');
  const range = resolveRange('30d', '', '', SAMPLE_NOW);
  assert.ok(nvda && range);
  const times = newsForAsset(nvda, range).map((entry) => Date.parse(entry.article.publishedAt));
  assert.deepEqual(times, times.slice().sort((a, b) => b - a));
});
