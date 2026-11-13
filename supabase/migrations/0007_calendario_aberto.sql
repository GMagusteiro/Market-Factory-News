-- 0007: o calendário económico passa a ser público (decisão do Gonçalo). As notícias mantêm os limites por nível.
drop policy if exists "leitura por nivel" on public.calendar_events;
drop policy if exists "leitura publica" on public.calendar_events;
create policy "leitura publica" on public.calendar_events for select using (true);
