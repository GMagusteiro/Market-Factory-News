-- 0005: datas oficiais de decisão de taxas (Fed e Banco de Inglaterra). Gerado por scripts/gen-calendar.ts.
-- As datas de 2027 da Fed são provisórias até serem confirmadas. Repetir o script corrige-as (upsert por id).
insert into public.calendar_events (id, title, country, currency, impact, starts_at, is_sample) values
  ('fed-fomc-2026-12-09', 'Decisão de taxas de juro (Fed, FOMC)', 'Estados Unidos', 'USD', 'high', '2026-12-09T19:00:00.000Z', false),
  ('fed-fomc-2027-01-27', 'Decisão de taxas de juro (Fed, FOMC)', 'Estados Unidos', 'USD', 'high', '2027-01-27T19:00:00.000Z', false),
  ('fed-fomc-2027-03-17', 'Decisão de taxas de juro (Fed, FOMC)', 'Estados Unidos', 'USD', 'high', '2027-03-17T18:00:00.000Z', false),
  ('fed-fomc-2027-04-28', 'Decisão de taxas de juro (Fed, FOMC)', 'Estados Unidos', 'USD', 'high', '2027-04-28T18:00:00.000Z', false),
  ('fed-fomc-2027-06-09', 'Decisão de taxas de juro (Fed, FOMC)', 'Estados Unidos', 'USD', 'high', '2027-06-09T18:00:00.000Z', false),
  ('fed-fomc-2027-07-28', 'Decisão de taxas de juro (Fed, FOMC)', 'Estados Unidos', 'USD', 'high', '2027-07-28T18:00:00.000Z', false),
  ('fed-fomc-2027-09-15', 'Decisão de taxas de juro (Fed, FOMC)', 'Estados Unidos', 'USD', 'high', '2027-09-15T18:00:00.000Z', false),
  ('fed-fomc-2027-10-27', 'Decisão de taxas de juro (Fed, FOMC)', 'Estados Unidos', 'USD', 'high', '2027-10-27T18:00:00.000Z', false),
  ('fed-fomc-2027-12-08', 'Decisão de taxas de juro (Fed, FOMC)', 'Estados Unidos', 'USD', 'high', '2027-12-08T19:00:00.000Z', false),
  ('boe-mpc-2026-11-05', 'Decisão de taxas de juro (Banco de Inglaterra)', 'Reino Unido', 'GBP', 'high', '2026-11-05T12:00:00.000Z', false),
  ('boe-mpc-2026-12-17', 'Decisão de taxas de juro (Banco de Inglaterra)', 'Reino Unido', 'GBP', 'high', '2026-12-17T12:00:00.000Z', false),
  ('boe-mpc-2027-02-04', 'Decisão de taxas de juro (Banco de Inglaterra)', 'Reino Unido', 'GBP', 'high', '2027-02-04T12:00:00.000Z', false),
  ('boe-mpc-2027-03-18', 'Decisão de taxas de juro (Banco de Inglaterra)', 'Reino Unido', 'GBP', 'high', '2027-03-18T12:00:00.000Z', false),
  ('boe-mpc-2027-04-29', 'Decisão de taxas de juro (Banco de Inglaterra)', 'Reino Unido', 'GBP', 'high', '2027-04-29T11:00:00.000Z', false),
  ('boe-mpc-2027-06-17', 'Decisão de taxas de juro (Banco de Inglaterra)', 'Reino Unido', 'GBP', 'high', '2027-06-17T11:00:00.000Z', false),
  ('boe-mpc-2027-07-29', 'Decisão de taxas de juro (Banco de Inglaterra)', 'Reino Unido', 'GBP', 'high', '2027-07-29T11:00:00.000Z', false),
  ('boe-mpc-2027-09-16', 'Decisão de taxas de juro (Banco de Inglaterra)', 'Reino Unido', 'GBP', 'high', '2027-09-16T11:00:00.000Z', false),
  ('boe-mpc-2027-11-04', 'Decisão de taxas de juro (Banco de Inglaterra)', 'Reino Unido', 'GBP', 'high', '2027-11-04T12:00:00.000Z', false),
  ('boe-mpc-2027-12-16', 'Decisão de taxas de juro (Banco de Inglaterra)', 'Reino Unido', 'GBP', 'high', '2027-12-16T12:00:00.000Z', false)
on conflict (id) do update set title = excluded.title, starts_at = excluded.starts_at;
