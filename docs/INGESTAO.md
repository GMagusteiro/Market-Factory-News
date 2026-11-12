# Pôr a recolha de notícias a funcionar (passos do Gonçalo)

A função `supabase/functions/ingest-news/index.ts` lê os feeds oficiais (Fed, BCE, SEC) e guarda título, fonte, data, link e um excerto curto.

1. **SQL Editor** → nova query → colar `supabase/migrations/0004_fontes_oficiais.sql` → Run.
2. **Edge Functions** → Deploy a new function → nome `ingest-news` → colar o conteúdo de `supabase/functions/ingest-news/index.ts` → Deploy.
3. **Edge Functions → Secrets**: criar `INGEST_CONTACT` com o teu email (a SEC exige contacto no User-Agent). `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já existem sozinhas; nunca as copies para o site.
4. Testar: na página da função, "Test" (POST, corpo vazio). A resposta lista quantos artigos entraram por feed, ou o erro de cada um.
5. Agendar (SQL Editor), a cada 30 min. Substituir `<REF>` pelo código do projeto e `<SERVICE_KEY>` pela chave de serviço:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('ingest-news', '*/30 * * * *', $$
  select net.http_post(
    url := 'https://<REF>.supabase.co/functions/v1/ingest-news',
    headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_KEY>')
  );
$$);
```

Para parar: `select cron.unschedule('ingest-news');`

Limites conhecidos: sem agrupamento em histórias (cada artigo fica sozinho); ligação a ativos/temas por palavras-chave simples; o feed do BCE e da SEC podem mudar de endereço (a resposta do teste mostra o erro).
