// Gera supabase/migrations/0005_calendario_bancos_centrais.sql com as datas de decisão de taxas
// publicadas pelos próprios bancos centrais (Fed e Banco de Inglaterra). Ver docs/SOURCES.md.
// Uso: npx tsx scripts/gen-calendar.ts
import { writeFileSync } from 'node:fs';

import { zonedToUtc } from '../src/lib/zoned';

// Fed: https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm (decisão às 14:00 de Nova Iorque, 2.º dia).
// 2026 "Scheduled"; 2027 "Tentative" (provisório até ser confirmado na reunião anterior).
const FOMC = ['2026-12-09', '2027-01-27', '2027-03-17', '2027-04-28', '2027-06-09', '2027-07-28', '2027-09-15', '2027-10-27', '2027-12-08'];

// Banco de Inglaterra: https://www.bankofengland.co.uk/monetary-policy/upcoming-mpc-dates (anúncio às 12:00 de Londres).
const BOE = ['2026-11-05', '2026-12-17', '2027-02-04', '2027-03-18', '2027-04-29', '2027-06-17', '2027-07-29', '2027-09-16', '2027-11-04', '2027-12-16'];

// BCE: https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html (decisão no 2.º dia, 14:15 de Frankfurt).
const ECB = ['2026-12-17', '2027-02-04', '2027-03-18', '2027-04-29', '2027-06-10', '2027-07-22', '2027-09-09', '2027-10-28', '2027-12-16'];

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const row = (id: string, title: string, country: string, currency: string, when: Date) =>
  `(${q(id)}, ${q(title)}, ${q(country)}, ${q(currency)}, 'high', ${q(when.toISOString())}, false)`;

const rows = [
  ...FOMC.map((d) => row(`fed-fomc-${d}`, 'Decisão de taxas de juro (Fed, FOMC)', 'Estados Unidos', 'USD', zonedToUtc(d, '14:00', 'America/New_York'))),
  ...BOE.map((d) => row(`boe-mpc-${d}`, 'Decisão de taxas de juro (Banco de Inglaterra)', 'Reino Unido', 'GBP', zonedToUtc(d, '12:00', 'Europe/London'))),
];

const sql = `-- 0005: datas oficiais de decisão de taxas (Fed e Banco de Inglaterra). Gerado por scripts/gen-calendar.ts.
-- As datas de 2027 da Fed são provisórias até serem confirmadas. Repetir o script corrige-as (upsert por id).
insert into public.calendar_events (id, title, country, currency, impact, starts_at, is_sample) values
  ${rows.join(',\n  ')}
on conflict (id) do update set title = excluded.title, starts_at = excluded.starts_at;
`;

writeFileSync(new URL('../supabase/migrations/0005_calendario_bancos_centrais.sql', import.meta.url), sql);
console.log(`${rows.length} eventos escritos`);

const ecbRows = ECB.map((d) => row(`bce-gc-${d}`, 'Decisão de taxas de juro (BCE)', 'Zona Euro', 'EUR', zonedToUtc(d, '14:15', 'Europe/Berlin')));
const ecbSql = `-- 0006: datas oficiais de decisão de taxas do BCE. Gerado por scripts/gen-calendar.ts.
insert into public.calendar_events (id, title, country, currency, impact, starts_at, is_sample) values
  ${ecbRows.join(',\n  ')}
on conflict (id) do update set title = excluded.title, starts_at = excluded.starts_at;
`;
writeFileSync(new URL('../supabase/migrations/0006_calendario_bce.sql', import.meta.url), ecbSql);
console.log(`${ecbRows.length} eventos do BCE escritos`);
