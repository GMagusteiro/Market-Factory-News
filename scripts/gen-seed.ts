// Gera supabase/migrations/0002_seed_exemplo.sql a partir dos dados de exemplo.
// Uso: npx tsx scripts/gen-seed.ts
import { writeFileSync } from 'node:fs';

import { articles, assets, calendarEvents, sources, themes } from '../src/data';

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const arr = (a: string[]) => (a.length ? `array[${a.map(q).join(',')}]::text[]` : `'{}'::text[]`);
const rows = (items: string[]) => items.join(',\n  ');

const schema = `-- 0002: ids de texto (compatíveis com os dados), marcação de dados de exemplo e semente.
-- As tabelas abaixo ainda estão vazias, por isso são recriadas.
drop table if exists public.article_assets, public.article_themes, public.articles,
  public.stories, public.calendar_events cascade;

alter table public.themes add column if not exists description text;
alter table public.sources add column if not exists is_sample boolean not null default false;

create table public.stories (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  created_at timestamptz not null default now()
);

create table public.articles (
  id text primary key default gen_random_uuid()::text,
  story_id text references public.stories(id) on delete set null,
  source_id text not null references public.sources(id),
  type text not null check (type in ('news','opinion','official')),
  title text not null,
  summary text,
  url text not null unique,
  published_at timestamptz not null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
create index articles_published_idx on public.articles (published_at desc);
create index articles_story_idx on public.articles (story_id);

create table public.article_assets (
  article_id text not null references public.articles(id) on delete cascade,
  asset_slug text not null references public.assets(slug) on delete cascade,
  primary key (article_id, asset_slug)
);
create index article_assets_asset_idx on public.article_assets (asset_slug);

create table public.article_themes (
  article_id text not null references public.articles(id) on delete cascade,
  theme_id text not null references public.themes(id) on delete cascade,
  primary key (article_id, theme_id)
);

create table public.calendar_events (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  country text,
  currency text,
  impact text not null check (impact in ('low','medium','high')),
  starts_at timestamptz not null,
  actual text,
  forecast text,
  previous text,
  is_sample boolean not null default false
);
create index calendar_starts_idx on public.calendar_events (starts_at);

alter table public.stories enable row level security;
alter table public.articles enable row level security;
alter table public.article_assets enable row level security;
alter table public.article_themes enable row level security;
alter table public.calendar_events enable row level security;
create policy "leitura publica" on public.stories for select using (true);
create policy "leitura publica" on public.articles for select using (true);
create policy "leitura publica" on public.article_assets for select using (true);
create policy "leitura publica" on public.article_themes for select using (true);
create policy "leitura publica" on public.calendar_events for select using (true);
`;

const stories = new Map<string, string>();
for (const a of articles) if (!stories.has(a.storyId)) stories.set(a.storyId, a.title);

const out: string[] = [schema, '-- Semente: DADOS DE EXEMPLO (fictícios). Apagar com: delete from articles where is_sample;'];

out.push(`insert into public.sources (id,name,type,tier,is_sample) values\n  ${rows(
  sources.map((s) => `(${q(s.id)},${q(s.name)},${q(s.type)},${s.tier},true)`),
)}\non conflict (id) do nothing;`);

out.push(`insert into public.themes (id,name,description) values\n  ${rows(
  themes.map((t) => `(${q(t.slug)},${q(t.name)},${q(t.description ?? '')})`),
)}\non conflict (id) do nothing;`);

out.push(`insert into public.assets (slug,symbol,name,kind,currencies,aliases) values\n  ${rows(
  assets.map((a) => `(${q(a.slug)},${q(a.symbol)},${q(a.name)},${q(a.kind)},${arr(a.currencies)},${arr(a.aliases)})`),
)}\non conflict (slug) do nothing;`);

const links = assets.flatMap((a) => (a.themes ?? []).map((t) => `(${q(a.slug)},${q(t)})`));
if (links.length) out.push(`insert into public.asset_themes (asset_slug,theme_id) values\n  ${rows(links)}\non conflict do nothing;`);

out.push(`insert into public.stories (id,title) values\n  ${rows([...stories].map(([id, t]) => `(${q(id)},${q(t)})`))}\non conflict (id) do nothing;`);

out.push(`insert into public.articles (id,story_id,source_id,type,title,url,published_at,is_sample) values\n  ${rows(
  articles.map((a) => `(${q(a.id)},${q(a.storyId)},${q(a.sourceId)},${q(a.type)},${q(a.title)},${q(a.url)},${q(a.publishedAt)},true)`),
)}\non conflict (id) do nothing;`);

const aa = articles.flatMap((a) => a.assetSlugs.map((s) => `(${q(a.id)},${q(s)})`));
out.push(`insert into public.article_assets (article_id,asset_slug) values\n  ${rows(aa)}\non conflict do nothing;`);
const at = articles.flatMap((a) => a.themes.map((t) => `(${q(a.id)},${q(t)})`));
out.push(`insert into public.article_themes (article_id,theme_id) values\n  ${rows(at)}\non conflict do nothing;`);

out.push(`insert into public.calendar_events (id,title,country,currency,impact,starts_at,is_sample) values\n  ${rows(
  calendarEvents.map((e) => `(${q(e.id)},${q(e.title)},${q(e.country)},${q(e.currency)},${q(e.impact)},${q(e.datetime)},true)`),
)}\non conflict (id) do nothing;`);

writeFileSync('supabase/migrations/0002_seed_exemplo.sql', out.join('\n\n') + '\n');
console.log('ok', { articles: articles.length, stories: stories.size, assets: assets.length, events: calendarEvents.length });
