# Alargar o universo de empresas (passos do Gonçalo)

Objetivo: passar de 16 ações de exemplo para as ~500 maiores empresas cotadas nos EUA, com notícias de 8-K (saídas de CEO, resultados, aquisições) para todas.

1. **SQL Editor**: corre `supabase/migrations/0011_assets_cik.sql` (acrescenta a coluna `cik`, o identificador da SEC).
2. **Edge Functions > Deploy a new function > Via Editor**, nome `sync-assets`: cola `supabase/functions/sync-assets/index.ts` e faz Deploy. Esta função lê a lista oficial da SEC (`company_tickers.json`) e acrescenta as empresas à tabela `assets`. As 16 que já tens ficam como estão (só ganham o `cik`).
3. Abre a função e carrega em **Test / Invoke**. Para outro número de empresas, usa o endereço com `?limit=300` (máximo 1000). A resposta mostra `novas` e `cik_atualizado`. Precisa do segredo `INGEST_CONTACT`, que já criaste.
4. Volta a colar `supabase/functions/ingest-news/index.ts` na função `ingest-news` e faz Deploy. A partir daqui lê o feed global de 8-K (4 páginas de 100) e guarda os das empresas do universo.
5. No site, pesquisa por exemplo "Tesla" ou "Visa" para confirmar que aparecem.

Limites conhecidos
- A lista da SEC vem ordenada por dimensão, mas só traz empresas que reportam à SEC (EUA e algumas estrangeiras). Europa, Portugal e outros mercados ficam para outra fonte.
- O feed global só mostra os últimos 400 relatórios 8-K por execução; em dias muito cheios podem escapar alguns entre execuções de 30 minutos. Se acontecer, passamos a correr mais vezes.
- Nomes curtos e comuns (Visa, Target, Ford) podem dar falsos positivos nas notícias por palavra-chave; os 8-K são ligados por CIK, por isso esses estão certos.
- Temas por empresa (ex.: terras raras) continuam manuais; as novas empresas entram sem tema.
