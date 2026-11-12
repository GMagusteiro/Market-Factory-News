-- 0006: datas oficiais de decisão de taxas do BCE. Gerado por scripts/gen-calendar.ts.
insert into public.calendar_events (id, title, country, currency, impact, starts_at, is_sample) values
  ('bce-gc-2026-12-17', 'Decisão de taxas de juro (BCE)', 'Zona Euro', 'EUR', 'high', '2026-12-17T13:15:00.000Z', false),
  ('bce-gc-2027-02-04', 'Decisão de taxas de juro (BCE)', 'Zona Euro', 'EUR', 'high', '2027-02-04T13:15:00.000Z', false),
  ('bce-gc-2027-03-18', 'Decisão de taxas de juro (BCE)', 'Zona Euro', 'EUR', 'high', '2027-03-18T13:15:00.000Z', false),
  ('bce-gc-2027-04-29', 'Decisão de taxas de juro (BCE)', 'Zona Euro', 'EUR', 'high', '2027-04-29T12:15:00.000Z', false),
  ('bce-gc-2027-06-10', 'Decisão de taxas de juro (BCE)', 'Zona Euro', 'EUR', 'high', '2027-06-10T12:15:00.000Z', false),
  ('bce-gc-2027-07-22', 'Decisão de taxas de juro (BCE)', 'Zona Euro', 'EUR', 'high', '2027-07-22T12:15:00.000Z', false),
  ('bce-gc-2027-09-09', 'Decisão de taxas de juro (BCE)', 'Zona Euro', 'EUR', 'high', '2027-09-09T12:15:00.000Z', false),
  ('bce-gc-2027-10-28', 'Decisão de taxas de juro (BCE)', 'Zona Euro', 'EUR', 'high', '2027-10-28T12:15:00.000Z', false),
  ('bce-gc-2027-12-16', 'Decisão de taxas de juro (BCE)', 'Zona Euro', 'EUR', 'high', '2027-12-16T13:15:00.000Z', false)
on conflict (id) do update set title = excluded.title, starts_at = excluded.starts_at;
