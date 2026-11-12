-- 0003: perfis (nível free/premium), apagar a própria conta e acesso por nível.
-- Colar no SQL Editor do Supabase e carregar em Run.

-- Perfil de cada utilizador. O utilizador só LÊ o seu perfil: não há políticas de
-- escrita, por isso ninguém consegue dar-se premium. Tu alteras no painel (Table Editor).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free','premium')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "perfil ler" on public.profiles;
create policy "perfil ler" on public.profiles
  for select to authenticated using (id = auth.uid());

-- Cria o perfil automaticamente quando alguém se regista.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Perfis para utilizadores que já existam.
insert into public.profiles (id) select id from auth.users on conflict do nothing;

-- Apagar a própria conta (RGPD). Remove também o perfil e a watchlist (cascade).
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Acesso por nível (aplicado no servidor, não só no ecrã):
--   visitante: notícias dos últimos 7 dias e calendário de -1 a +7 dias;
--   com conta (free ou premium): tudo.
-- Os dados de exemplo (is_sample) ficam sempre visíveis, para testares sem datas a expirar.
drop policy if exists "leitura publica" on public.articles;
create policy "leitura por nivel" on public.articles
  for select using (
    is_sample
    or published_at >= now() - interval '7 days'
    or auth.uid() is not null
  );

drop policy if exists "leitura publica" on public.calendar_events;
create policy "leitura por nivel" on public.calendar_events
  for select using (
    is_sample
    or (starts_at >= now() - interval '1 day' and starts_at <= now() + interval '7 days')
    or auth.uid() is not null
  );
