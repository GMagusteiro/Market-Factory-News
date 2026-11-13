-- 0006: datas oficiais de decisão de taxas do BCE. Gerado por scripts/gen-calendar.ts.
insert into public.calendar_events (id, title, country, currency, impact, starts_at, is_sample) values
  ('bce-gc-2026-12-17', 'Interest rate decision (ECB)', 'Euro Area', 'EUR', 'high', '2026-12-17T13:15:00.000Z', false),
  ('bce-gc-2027-02-04', 'Interest rate decision (ECB)', 'Euro Area', 'EUR', 'high', '2027-02-04T13:15:00.000Z', false),
  ('bce-gc-2027-03-18', 'Interest rate decision (ECB)', 'Euro Area', 'EUR', 'high', '2027-03-18T13:15:00.000Z', false),
  ('bce-gc-2027-04-29', 'Interest rate decision (ECB)', 'Euro Area', 'EUR', 'high', '2027-04-29T12:15:00.000Z', false),
  ('bce-gc-2027-06-10', 'Interest rate decision (ECB)', 'Euro Area', 'EUR', 'high', '2027-06-10T12:15:00.000Z', false),
  ('bce-gc-2027-07-22', 'Interest rate decision (ECB)', 'Euro Area', 'EUR', 'high', '2027-07-22T12:15:00.000Z', false),
  ('bce-gc-2027-09-09', 'Interest rate decision (ECB)', 'Euro Area', 'EUR', 'high', '2027-09-09T12:15:00.000Z', false),
  ('bce-gc-2027-10-28', 'Interest rate decision (ECB)', 'Euro Area', 'EUR', 'high', '2027-10-28T12:15:00.000Z', false),
  ('bce-gc-2027-12-16', 'Interest rate decision (ECB)', 'Euro Area', 'EUR', 'high', '2027-12-16T13:15:00.000Z', false)
on conflict (id) do update set title = excluded.title, country = excluded.country, starts_at = excluded.starts_at;
