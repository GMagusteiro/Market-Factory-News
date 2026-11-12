# Roadmap — MarketLens

Regra de trabalho: antes de cada fase escreve-se um plano curto, o Gonçalo aprova, e só depois se executa. Uma funcionalidade só está "feita" depois de testada a correr no browser e de ter commit próprio.

## Fase 1 — Ação principal a funcionar no browser (hoje)

Objetivo: abrir a app, escolher um ativo, escolher um período e ver notícias. Dados locais (JSON), sem backend.

- Projeto Expo + Expo Router + TypeScript, web primeiro (saída estática)
- Design system (cores, tipografia, espaçamentos) num único sítio
- Ecrã de pesquisa/seleção de ativo (ações + pares forex) com dados locais
- Filtro de período (24h, 7 dias, 30 dias, personalizado)
- Lista de notícias com fonte, tipo (notícia/opinião/oficial), data e link
- Watchlist local (guardada no dispositivo)
- Calendário económico com dados locais de exemplo
- Aviso legal visível (não é aconselhamento financeiro)
- Testado no browser (desktop e largura de telemóvel)

**Pronto quando:** no browser, escolho NVIDIA, mudo o período e a lista muda; adiciono à watchlist; abro o calendário.

## Fase 2 — Contas, base de dados e sincronização

- Projeto Supabase; Postgres com Row Level Security em todas as tabelas
- Tabelas: ativos, notícias, fontes, eventos do calendário, watchlists
- Conta por email (ligação mágica) e/ou Google (Supabase Auth)
- Edge Function agendada para recolher notícias (RSS/APIs) e calendário; chaves só aqui
- Associação notícia–ativo (aliases) e remoção de duplicados
- A app deixa de usar JSON local e lê do Supabase; watchlist sincronizada
- Apagar conta no site

## Fase 3 — Onboarding e analytics (pronto para publicar)

- Onboarding completo (fluxo do PRD, secção 6), sem paywall
- PostHog com os eventos do funil; Sentry para erros
- Resend: email de boas-vindas e de confirmação de eliminação de conta, via Edge Function
- Política de privacidade, termos e consentimento de cookies (RGPD) antes de analytics
- Deploy no Cloudflare Pages (plano gratuito, endereço .pages.dev para começar)

## Fase 4 — Polimento e lançamento público do site

- Polimento visual, estados vazios, erros e carregamento, acessibilidade, uso em telemóvel
- SEO: páginas por ativo, títulos e descrições, sitemap
- Revisão legal: aviso de que não é aconselhamento financeiro, privacidade, cookies, apagar conta
- Lançamento público; correções = novo deploy

## Fase 5 (depois do lançamento) — Monetização

Só começa quando houver utilizadores que voltam (ver métricas no PRD).

- Publicidade (rede de anúncios aprovada, consentimento de cookies) e/ou subscrição Pro na web (por exemplo Stripe)
- Limites do plano gratuito e ponto único de verificação de permissões
- Eventos `paywall_viewed` e `subscribed`, se houver subscrição

## Fase 6 (opcional, quando houver tração e orçamento) — App iOS

- Reaproveitar Supabase, Edge Functions e a recolha de notícias; ecrãs em Expo para iOS
- Conta Apple Developer (99 $/ano) e build na nuvem com EAS Build (não precisa de Mac)
- Requisitos da Apple: Iniciar sessão com a Apple se houver outro login social, apagar conta in-app com revogação do token, política de privacidade e termos, restaurar compras, nada de "em breve", permissões com justificação
- Superwall + StoreKit para subscrições na app; TestFlight; App Store; correções rápidas com EAS Update
