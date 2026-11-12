// Testa as migrações 0001-0003 num Postgres local (PGlite): perfis, nível e RLS.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { PGlite } from '@electric-sql/pglite';

const dir = join(__dirname, '..', 'migrations');

async function setup() {
  const db = new PGlite();
  // Simula o que o Supabase já traz: schema auth, auth.uid() e os papéis anon/authenticated.
  await db.exec(`
    create schema auth;
    create table auth.users(id uuid primary key default gen_random_uuid());
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.sub', true), '')::uuid $$;
    create role anon; create role authenticated;`);
  for (const file of ['0001_init.sql', '0002_seed_exemplo.sql', '0003_contas_e_acesso.sql']) {
    await db.exec(readFileSync(join(dir, file), 'utf8'));
  }
  await db.exec(`
    grant usage on schema public, auth to anon, authenticated;
    grant select on all tables in schema public to anon, authenticated;
    grant insert, delete on public.watchlist_items to authenticated;
    grant select, delete on auth.users to authenticated;
    insert into articles(id,source_id,type,title,url,published_at,is_sample) values
      ('r-new','agencia-exemplo','news','novo','https://x/1', now() - interval '1 day', false),
      ('r-old','agencia-exemplo','news','antigo','https://x/2', now() - interval '20 days', false);
    insert into calendar_events(id,title,impact,starts_at,is_sample) values
      ('c-near','perto','high', now() + interval '2 days', false),
      ('c-far','longe','high', now() + interval '30 days', false);`);
  return db;
}

async function as(db: PGlite, role: 'anon' | 'authenticated', userId: string | null, sql: string) {
  await db.exec(`set role ${role}`);
  await db.exec(userId ? `set request.jwt.sub='${userId}'` : `reset request.jwt.sub`);
  try {
    return (await db.query<{ c: number }>(sql)).rows[0]?.c;
  } finally {
    await db.exec('reset role');
  }
}

const realArticles = `select count(*)::int c from articles where not is_sample`;
const realEvents = `select count(*)::int c from calendar_events where not is_sample`;

test('visitante vê só 7 dias de notícias e o calendário próximo; amostras sempre visíveis', async () => {
  const db = await setup();
  assert.equal(await as(db, 'anon', null, realArticles), 1);
  assert.equal(await as(db, 'anon', null, realEvents), 1);
  assert.equal(await as(db, 'anon', null, `select count(*)::int c from articles where is_sample`), 203);
});

test('conta registada vê tudo, e o perfil é criado sozinho com tier free', async () => {
  const db = await setup();
  const { id } = (await db.query<{ id: string }>(`insert into auth.users default values returning id`)).rows[0];
  assert.equal(await as(db, 'authenticated', id, realArticles), 2);
  assert.equal(await as(db, 'authenticated', id, realEvents), 2);
  assert.equal(await as(db, 'authenticated', id, `select count(*)::int c from profiles where tier='free'`), 1);
});

test('o utilizador não consegue dar-se premium', async () => {
  const db = await setup();
  const { id } = (await db.query<{ id: string }>(`insert into auth.users default values returning id`)).rows[0];
  await db.exec(`set role authenticated; set request.jwt.sub='${id}'`);
  let changed = 0;
  try {
    changed = (await db.query(`update profiles set tier='premium' where id='${id}' returning 1`)).rows.length;
  } catch {
    changed = 0; // sem permissão de escrita: também é bloqueio
  }
  await db.exec('reset role');
  assert.equal(changed, 0);
  assert.equal((await db.query<{ tier: string }>(`select tier from profiles where id='${id}'`)).rows[0].tier, 'free');
});

test('watchlist é privada e apagar a conta remove tudo; visitante não pode apagar', async () => {
  const db = await setup();
  const a = (await db.query<{ id: string }>(`insert into auth.users default values returning id`)).rows[0].id;
  const b = (await db.query<{ id: string }>(`insert into auth.users default values returning id`)).rows[0].id;
  await db.exec(`insert into watchlist_items(user_id,asset_slug) values ('${a}','nvda'),('${b}','aapl')`);
  assert.equal(await as(db, 'authenticated', a, `select count(*)::int c from watchlist_items`), 1);

  await db.exec(`set role authenticated; set request.jwt.sub='${a}'`);
  await db.query(`select delete_my_account()`);
  await db.exec('reset role');
  const left = async (table: string, col: string) =>
    (await db.query<{ c: number }>(`select count(*)::int c from ${table} where ${col}='${a}'`)).rows[0].c;
  assert.equal(await left('auth.users', 'id'), 0);
  assert.equal(await left('profiles', 'id'), 0);
  assert.equal(await left('watchlist_items', 'user_id'), 0);

  await db.exec(`set role anon; reset request.jwt.sub`);
  await assert.rejects(() => db.query(`select delete_my_account()`));
  await db.exec('reset role');
});
