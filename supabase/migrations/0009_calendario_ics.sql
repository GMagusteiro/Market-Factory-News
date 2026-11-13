-- 0009: ligação privada (token) para subscrever o calendário da watchlist no Google/Apple/Outlook.
-- O token é lido/gerado só por funções; a tabela em si não é acessível pelo cliente.
create table if not exists public.calendar_feeds (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);
alter table public.calendar_feeds enable row level security;
revoke all on public.calendar_feeds from anon, authenticated;

-- Devolve o token da conta (cria-o se ainda não existir).
create or replace function public.my_calendar_token()
returns uuid language plpgsql security definer set search_path = public as $$
declare t uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into calendar_feeds (user_id) values (auth.uid()) on conflict do nothing;
  select token into t from calendar_feeds where user_id = auth.uid();
  return t;
end $$;

-- Gera um token novo: a ligação antiga deixa de funcionar.
create or replace function public.reset_calendar_token()
returns uuid language plpgsql security definer set search_path = public as $$
declare t uuid := gen_random_uuid();
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into calendar_feeds (user_id, token) values (auth.uid(), t)
    on conflict (user_id) do update set token = excluded.token, created_at = now();
  return t;
end $$;

revoke all on function public.my_calendar_token() from public, anon;
revoke all on function public.reset_calendar_token() from public, anon;
grant execute on function public.my_calendar_token() to authenticated;
grant execute on function public.reset_calendar_token() to authenticated;
