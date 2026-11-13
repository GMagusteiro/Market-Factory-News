-- 0011: identificador da SEC (CIK) por empresa, para ligar relatórios 8-K sem um pedido por empresa.
alter table public.assets add column if not exists cik text;
create index if not exists assets_cik_idx on public.assets (cik);
