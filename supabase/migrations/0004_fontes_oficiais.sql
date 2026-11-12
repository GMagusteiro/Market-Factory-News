-- Fontes oficiais reais usadas pela função ingest-news (ver docs/SOURCES.md).
insert into public.sources (id, name, type, tier, is_sample) values
  ('fed', 'Federal Reserve', 'official', 1, false),
  ('bce', 'Banco Central Europeu', 'official', 1, false),
  ('sec', 'SEC (EUA)', 'official', 1, false)
on conflict (id) do nothing;
