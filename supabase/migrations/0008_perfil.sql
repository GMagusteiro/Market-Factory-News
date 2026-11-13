-- 0008: preferências na conta (idioma e fuso horário).
-- O utilizador só pode alterar estas duas colunas na sua própria linha; o nível (tier) continua só teu.
alter table public.profiles add column if not exists lang text check (lang in ('pt','en','es'));
alter table public.profiles add column if not exists time_zone text check (char_length(time_zone) <= 64);

-- O Supabase dá todos os privilégios às tabelas novas; retiramos a escrita e devolvemos só as 2 colunas.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (lang, time_zone) on public.profiles to authenticated;

drop policy if exists "perfil atualizar" on public.profiles;
create policy "perfil atualizar" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
