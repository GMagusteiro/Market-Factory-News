-- 0005: datas oficiais de decisão de taxas (Fed e Banco de Inglaterra). Gerado por scripts/gen-calendar.ts.
-- As datas de 2027 da Fed são provisórias até serem confirmadas. Repetir o script corrige-as (upsert por id).
insert into public.calendar_events (id, title, country, currency, impact, starts_at, is_sample) values
  ('fed-fomc-2026-12-09', 'Interest rate decision (Fed, FOMC)', 'United States', 'USD', 'high', '2026-12-09T19:00:00.000Z', false),
  ('fed-fomc-2027-01-27', 'Interest rate decision (Fed, FOMC)', 'United States', 'USD', 'high', '2027-01-27T19:00:00.000Z', false),
  ('fed-fomc-2027-03-17', 'Interest rate decision (Fed, FOMC)', 'United States', 'USD', 'high', '2027-03-17T18:00:00.000Z', false),
  ('fed-fomc-2027-04-28', 'Interest rate decision (Fed, FOMC)', 'United States', 'USD', 'high', '2027-04-28T18:00:00.000Z', false),
  ('fed-fomc-2027-06-09', 'Interest rate decision (Fed, FOMC)', 'United States', 'USD', 'high', '2027-06-09T18:00:00.000Z', false),
  ('fed-fomc-2027-07-28', 'Interest rate decision (Fed, FOMC)', 'United States', 'USD', 'high', '2027-07-28T18:00:00.000Z', false),
  ('fed-fomc-2027-09-15', 'Interest rate decision (Fed, FOMC)', 'United States', 'USD', 'high', '2027-09-15T18:00:00.000Z', false),
  ('fed-fomc-2027-10-27', 'Interest rate decision (Fed, FOMC)', 'United States', 'USD', 'high', '2027-10-27T18:00:00.000Z', false),
  ('fed-fomc-2027-12-08', 'Interest rate decision (Fed, FOMC)', 'United States', 'USD', 'high', '2027-12-08T19:00:00.000Z', false),
  ('boe-mpc-2026-11-05', 'Interest rate decision (Bank of England)', 'United Kingdom', 'GBP', 'high', '2026-11-05T12:00:00.000Z', false),
  ('boe-mpc-2026-12-17', 'Interest rate decision (Bank of England)', 'United Kingdom', 'GBP', 'high', '2026-12-17T12:00:00.000Z', false),
  ('boe-mpc-2027-02-04', 'Interest rate decision (Bank of England)', 'United Kingdom', 'GBP', 'high', '2027-02-04T12:00:00.000Z', false),
  ('boe-mpc-2027-03-18', 'Interest rate decision (Bank of England)', 'United Kingdom', 'GBP', 'high', '2027-03-18T12:00:00.000Z', false),
  ('boe-mpc-2027-04-29', 'Interest rate decision (Bank of England)', 'United Kingdom', 'GBP', 'high', '2027-04-29T11:00:00.000Z', false),
  ('boe-mpc-2027-06-17', 'Interest rate decision (Bank of England)', 'United Kingdom', 'GBP', 'high', '2027-06-17T11:00:00.000Z', false),
  ('boe-mpc-2027-07-29', 'Interest rate decision (Bank of England)', 'United Kingdom', 'GBP', 'high', '2027-07-29T11:00:00.000Z', false),
  ('boe-mpc-2027-09-16', 'Interest rate decision (Bank of England)', 'United Kingdom', 'GBP', 'high', '2027-09-16T11:00:00.000Z', false),
  ('boe-mpc-2027-11-04', 'Interest rate decision (Bank of England)', 'United Kingdom', 'GBP', 'high', '2027-11-04T12:00:00.000Z', false),
  ('boe-mpc-2027-12-16', 'Interest rate decision (Bank of England)', 'United Kingdom', 'GBP', 'high', '2027-12-16T12:00:00.000Z', false)
on conflict (id) do update set title = excluded.title, country = excluded.country, starts_at = excluded.starts_at;
