-- Banco do Canadá: comunicados de imprensa (termos: uso livre com atribuição; ver docs/SOURCES.md).
insert into public.sources (id, name, type, tier, is_sample) values
  ('boc', 'Bank of Canada', 'official', 1, false)
on conflict (id) do nothing;
