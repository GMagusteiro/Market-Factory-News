-- MarketLens: esquema inicial. Colar no Supabase (SQL Editor > New query > Run).
-- Conteúdo (ativos, fontes, notícias, calendário): leitura pública, escrita só pelo servidor
-- (Edge Functions com service role, que ignora RLS). Watchlist: só o próprio utilizador.

create table if not exists public.sources (
  id text primary key,
  name text not null,
  type text not null check (type in ('news','opinion','official')),
  tier smallint not null check (tier in (1,2,3)),
  feed_url text
);

create table if not exists public.themes (
  id text primary key,
  name text not null
);

create table if not exists public.assets (
  slug text primary key,
  symbol text not null,
  name text not null,
  kind text not null check (kind in ('stock','forex')),
  currencies text[] not null default '{}',
  aliases text[] not null default '{}'
);

create table if not exists public.asset_themes (
  asset_slug text not null references public.assets(slug) on delete cascade,
  theme_id text not null references public.themes(id) on delete cascade,
  primary key (asset_slug, theme_id)
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories(id) on delete set null,
  source_id text not null references public.sources(id),
  title text not null,
  summary text,                       -- resumo próprio e curto, nunca o texto integral
  url text not null unique,
  published_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists articles_published_idx on public.articles (published_at desc);
create index if not exists articles_story_idx on public.articles (story_id);

create table if not exists public.article_assets (
  article_id uuid not null references public.articles(id) on delete cascade,
  asset_slug text not null references public.assets(slug) on delete cascade,
  primary key (article_id, asset_slug)
);
create index if not exists article_assets_asset_idx on public.article_assets (asset_slug);

create table if not exists public.article_themes (
  article_id uuid not null references public.articles(id) on delete cascade,
  theme_id text not null references public.themes(id) on delete cascade,
  primary key (article_id, theme_id)
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  country text,
  currency text,
  impact text not null check (impact in ('low','medium','high')),
  starts_at timestamptz not null,
  actual text,
  forecast text,
  previous text
);
create index if not exists calendar_starts_idx on public.calendar_events (starts_at);

create table if not exists public.watchlist_items (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  asset_slug text not null references public.assets(slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, asset_slug)
);

-- RLS em todas as tabelas
alter table public.sources enable row level security;
alter table public.themes enable row level security;
alter table public.assets enable row level security;
alter table public.asset_themes enable row level security;
alter table public.stories enable row level security;
alter table public.articles enable row level security;
alter table public.article_assets enable row level security;
alter table public.article_themes enable row level security;
alter table public.calendar_events enable row level security;
alter table public.watchlist_items enable row level security;

-- Conteúdo: qualquer pessoa pode ler; ninguém escreve pelo cliente (sem policy de escrita).
create policy "leitura publica" on public.sources for select using (true);
create policy "leitura publica" on public.themes for select using (true);
create policy "leitura publica" on public.assets for select using (true);
create policy "leitura publica" on public.asset_themes for select using (true);
create policy "leitura publica" on public.stories for select using (true);
create policy "leitura publica" on public.articles for select using (true);
create policy "leitura publica" on public.article_assets for select using (true);
create policy "leitura publica" on public.article_themes for select using (true);
create policy "leitura publica" on public.calendar_events for select using (true);

-- Watchlist: cada utilizador só vê e altera as suas linhas.
create policy "watchlist ler" on public.watchlist_items
  for select to authenticated using (user_id = auth.uid());
create policy "watchlist inserir" on public.watchlist_items
  for insert to authenticated with check (user_id = auth.uid());
create policy "watchlist apagar" on public.watchlist_items
  for delete to authenticated using (user_id = auth.uid());
