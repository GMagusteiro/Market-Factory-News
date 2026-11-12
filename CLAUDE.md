# CLAUDE.md — MarketLens

Site de notícias de ações e forex por ativo e período (web primeiro, app iOS mais tarde), com calendário económico e watchlist. Documentos: `docs/PRD.md` (produto) e `docs/ROADMAP.md` (fases).

Estado atual: **Fase 1 concluída. Fase 2 em curso**: a relevância por temas (F5) já funciona com dados de exemplo locais, 18 testes de lógica e 31 verificações no browser. Falta na Fase 2: Supabase (tabelas com RLS, conta, recolha de notícias por Edge Function, watchlist sincronizada, apagar conta) e a fonte do calendário. Cliente Supabase ligado (`src/lib/supabase.ts`, variáveis `EXPO_PUBLIC_SUPABASE_URL/KEY` em `.env`, fallback para dados locais) e esquema em `supabase/migrations/0001_init.sql`. As migrações 0001 e 0002 (esquema + semente de exemplo) já foram corridas pelo Gonçalo no painel. As páginas leem do Supabase com fallback local (`src/data/remote.ts`; `useDataset()` em `src/data/index.ts`). O sandbox não alcança supabase.co: a leitura remota só se confirma no browser do Gonçalo. Limite conhecido: `fetchRows` lê as tabelas inteiras (até 5000 linhas); com notícias reais passa a consultas por ativo e período. Atualizar esta secção no fim de cada fase.

## Como trabalhamos

- Antes de cada fase: plano curto, esperar aprovação do Gonçalo, só depois executar.
- Um commit por mudança que funcione, mensagem clara. Nunca commit de segredos.
- Uma funcionalidade só está feita depois de testada a correr no browser (sem Mac, não há simulador de iPhone).
- Idioma: português europeu na interface, na documentação e nas conversas.

## Stack

- Site: Expo (React Native) com Expo Router (saída web estática para SEO), TypeScript. Web primeiro; app iOS mais tarde com a mesma base
- Backend: Supabase (Postgres, RLS em todas as tabelas, Auth, Edge Functions, Storage)
- Login: email com ligação mágica e/ou Google (Supabase Auth). Iniciar sessão com a Apple só na fase da app
- Receita: **só na Fase 5** (V1 gratuita e sem limites). Web: publicidade e/ou Stripe. Superwall + StoreKit só na app
- Analytics: PostHog · Erros: Sentry · Emails: Resend (a partir de Edge Functions)
- Publicação: deploy do site no Cloudflare Pages (plano gratuito). App Store/TestFlight só na Fase 6 (EAS Build na nuvem, sem Mac; conta Apple Developer paga)

## Regras que não se negoceiam

1. Chaves secretas (OpenAI, Claude, service role do Supabase, Resend) nunca dentro da app. Só em Edge Functions.
2. RLS ativo em todas as tabelas.
3. Legal: política de privacidade, termos, aviso de que não é aconselhamento financeiro, RGPD (consentimento de cookies antes de analytics ou publicidade), apagar conta no site. Os requisitos da Apple (Sign in with Apple se houver outro login social, apagar conta in-app com revogação do token, restaurar compras, nada de "em breve", permissões com justificação) aplicam-se só na Fase 6.
4. Design system único (cores, tipografia, espaçamentos num só ficheiro). Nada de estilos soltos nos ecrãs.
5. Conteúdo de notícias: só título, fonte, data, link e resumo curto próprio. Nunca texto integral.
6. Aviso legal: o conteúdo não é aconselhamento financeiro.
7. Relevância e ligações por tema são informação, nunca recomendação. Escrever "ativos potencialmente relacionados"; nunca "comprar", "vender" nem previsões de preço.

## Comandos

```bash
npm install                 # dependências
npx expo start --web        # servidor de desenvolvimento (browser)
npm run export:web          # gera o site estático em dist/ (e dist/404.html)
npx serve dist -l 3000      # serve o site gerado, para testar como em produção
npm run typecheck           # tsc --noEmit
npm run lint                # eslint
npm test                    # testes da lógica (node:test via tsx)
```

Antes de dar uma tarefa por feita: `npm run lint`, `npm run typecheck`, `npm test` e testar o fluxo no browser contra o site exportado.

## Arquitetura

- `src/app/`: rotas (Expo Router). `index` (pesquisa), `ativo/[slug]` (uma página estática por ativo, via `generateStaticParams`), `watchlist`, `calendario`, `+html.tsx`, `+not-found.tsx`.
- `src/design/`: design system. `tokens.ts` (cores claro/escuro, espaçamentos, tipografia) e `useTheme.ts`. Nada de cores ou tamanhos soltos nos ecrãs.
- `src/components/`: componentes de funcionalidade (`AssetPicker`, `PeriodFilter`, `NewsList`, `EventList`, `TopNav`, `SampleBanner`); `ui/` tem os blocos básicos (`AppText`, `Button`, `Chip`, `Badge`, `Card`, `Section`, `Screen`).
- `src/data/`: DADOS DE EXEMPLO (fictícios) em JSON + `index.ts`, que gera as notícias. `SAMPLE_NOW` é a data fixa de "agora" (2026-11-12T12:00Z); na Fase 2 passa a hora real e os dados vêm do Supabase.
- `src/lib/`: lógica pura e testada (`period.ts`, `search.ts`, `format.ts`, `usePeriod.ts`, `types.ts`). `news.ts` devolve as notícias de um ativo (menções diretas e ligadas por tema); `relevance.ts` agrupa artigos em histórias, pontua (0–100) e escolhe o "Em destaque".
- Dados de exemplo incluem temas (`themes.json`), nível de fiabilidade por fonte (`tier`) e 4 histórias multi-fonte. Cada ativo tem `themes`; cada artigo tem `assetSlugs`, `themes` e `storyId`.
- `src/state/watchlist.tsx`: watchlist em AsyncStorage (no browser, localStorage).

## Notas sobre o Expo SDK 58 e este ambiente

- O SDK 58 mudou coisas: ler sempre a documentação da versão (https://docs.expo.dev/llms.txt) antes de mexer em APIs do Expo.
- `+html.tsx` tem de desenhar `headNodes` e `bodyNodes` (de `useServerDocumentContext`), senão o HTML não leva scripts nem metadados. Título e descrição de cada página vêm de `export function generateMetadata()`, não de `<Head>`.
- TypeScript 6: os tipos de `@types/*` não entram sozinhos; estão declarados em `tsconfig.json` (`types`).
- Neste ambiente o `expo install` e o `expo lint` falham (rede bloqueada para api.expo.dev). Usar `npm install` com a versão de `node_modules/expo/bundledNativeModules.json`; o ESLint está configurado à mão em `eslint.config.js`.
- Alojamento estático: `npm run export:web` copia `+not-found.html` para `404.html`, que o Cloudflare Pages usa para URLs desconhecidos.
- Hidratação: o tema começa sempre claro (via `useSyncExternalStore`) para o HTML estático e o cliente coincidirem.
- Testes no browser: Playwright (Python) com `/usr/bin/google-chrome` contra `npx serve dist`. Esperar por `networkidle` antes de interagir, porque o HTML é estático e só fica interativo depois de hidratar.

## Decisões importantes

- Funil de analytics: `app_opened`, `onboarding_completed`, `asset_search_performed`. `paywall_viewed` e `subscribed` entram na Fase 5.
- Monetização adiada (decisão do Gonçalo): primeiro fluxo de utilizadores. Depois, subscrição Pro e/ou publicidade. Não assumir "tudo gratuito" espalhado pelo código: usar um único ponto de verificação de permissões quando houver planos.
- Diferenciador (pedido do Gonçalo): notícias relevantes que mexem com ativos sem os nomearem (ex.: ímanes e terras raras). Modelo: ativos pertencem a temas; artigos têm `assetSlugs` (menções diretas) e `themes`; artigos da mesma história partilham `storyId`. Relevância 0–100 = 35% recência + 30% fontes que confirmam + 20% fiabilidade da fonte + 15% alcance. Em destaque exige ≥2 fontes. Regras primeiro, IA depois.
- Fonte do calendário económico: por decidir.
- Web primeiro (decisão do Gonçalo: sem investimento inicial; não tem Mac). Framework: Expo Router web. Se o SEO for insuficiente, migrar o site para Next.js reaproveitando o backend.

## Modelo de acesso (decisão do Gonçalo)

Qualquer pessoa usa o site/app sem registo; o registo gratuito dá acesso a mais conteúdos (ver docs/PRD.md, 5.1). Os limites têm de ser aplicados no servidor (RLS), não só na interface. A mesma base de código serve website e app.

## Contas e acesso (implementado)

- `src/state/auth.tsx` (AuthProvider/useAuth): sessão Supabase, nível `guest|free|premium`. O nível vem de `profiles.tier`, que o utilizador só lê; o Gonçalo altera no painel do Supabase (Table Editor > profiles).
- `src/lib/access.ts`: regras (visitante: 24h e 7 dias, calendário 7 dias à frente sem histórico; com conta: tudo). Sem Supabase configurado nada é bloqueado.
- O servidor aplica o mesmo: `supabase/migrations/0003_contas_e_acesso.sql` (RLS por nível, `delete_my_account()`, trigger que cria o perfil). Dados `is_sample` ficam sempre visíveis.
- Watchlist: local para visitantes; com sessão junta a lista local com a da conta e sincroniza (`src/state/watchlist.tsx`). Ao sair, limpa a lista do dispositivo.
- Página `/conta`: entrar por ligação mágica (Google só se `EXPO_PUBLIC_GOOGLE_LOGIN=1` e o fornecedor estiver configurado no Supabase), sair, apagar conta.
- Testes: `npm test` (inclui `supabase/tests/acesso.test.ts`, que corre as migrações num Postgres local). Browser: `e2e/browser.py` (build SEM Supabase: `EXPO_PUBLIC_SUPABASE_URL= EXPO_PUBLIC_SUPABASE_KEY= npm run export:web`) e `e2e/visitante.py` (build COM Supabase). Ambos esperam `npx serve dist -l 3000`.
- Por configurar no painel do Supabase: Authentication > URL Configuration (Site URL e Redirect URLs com o endereço publicado). O servidor de email de origem do Supabase tem limite baixo de envios; para produção usar SMTP próprio (Resend).
