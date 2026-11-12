# Roadmap — MarketLens

Regra de trabalho: antes de cada fase escreve-se um plano curto, o Gonçalo aprova, e só depois se executa. Uma funcionalidade só está "feita" depois de testada a correr (simulador) e de ter commit próprio.

## Fase 1 — Ação principal a funcionar no simulador (hoje)

Objetivo: abrir a app, escolher um ativo, escolher um período e ver notícias. Dados locais (JSON), sem backend.

- Projeto Expo + Expo Router + TypeScript, iOS primeiro
- Design system (cores, tipografia, espaçamentos) num único sítio
- Ecrã de pesquisa/seleção de ativo (ações + pares forex) com dados locais
- Filtro de período (24h, 7 dias, 30 dias, personalizado)
- Lista de notícias com fonte, tipo (notícia/opinião/oficial), data e link
- Watchlist local (guardada no dispositivo)
- Calendário económico com dados locais de exemplo
- Aviso legal visível (não é aconselhamento financeiro)
- Testado no simulador

**Pronto quando:** num simulador de iPhone, escolho NVIDIA, mudo o período e a lista muda; adiciono à watchlist; abro o calendário.

## Fase 2 — Contas, base de dados e sincronização

- Projeto Supabase; Postgres com Row Level Security em todas as tabelas
- Tabelas: ativos, notícias, fontes, eventos do calendário, watchlists
- Iniciar sessão com a Apple (Supabase Auth)
- Edge Function agendada para recolher notícias (RSS/APIs) e calendário; chaves só aqui
- Associação notícia–ativo (aliases) e remoção de duplicados
- A app deixa de usar JSON local e lê do Supabase; watchlist sincronizada
- Apagar conta dentro da app (incluindo revogar token da Apple)

## Fase 3 — Onboarding e analytics (pronta para TestFlight)

- Onboarding completo (fluxo do PRD, secção 6), sem paywall
- PostHog com os eventos do funil; Sentry para erros
- Resend: email de boas-vindas e de confirmação de eliminação de conta, via Edge Function
- Política de privacidade e termos (páginas e ligações na app)
- Build no Xcode → TestFlight

## Fase 4 — Polimento e submissão na App Store

- Polimento visual, estados vazios, erros e carregamento, acessibilidade
- Permissões com justificação clara
- Revisão da lista de requisitos da Apple (login, apagar conta, privacidade, restaurar compras, sem "em breve")
- Metadados, capturas de ecrã, descrição
- Submissão; correções rápidas com EAS Update

## Fase 5 (depois do lançamento) — Monetização

Só começa quando houver utilizadores que voltam (ver métricas no PRD).

- Superwall + compras na app (StoreKit), paywall entre o sign-in e o ecrã principal, restaurar compras
- Limites do plano gratuito e ponto único de verificação de permissões
- Eventos `paywall_viewed` e `subscribed`
- Alternativa ou complemento: publicidade (pedido de consentimento de rastreamento, declaração de privacidade atualizada)
