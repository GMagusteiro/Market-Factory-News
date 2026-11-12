# CLAUDE.md — MarketLens

App iOS de notícias de ações e forex por ativo e período, com calendário económico e watchlist. Documentos: `docs/PRD.md` (produto) e `docs/ROADMAP.md` (fases).

Estado atual: **antes da Fase 1** (só documentação). Atualizar esta secção no fim de cada fase.

## Como trabalhamos

- Antes de cada fase: plano curto, esperar aprovação do Gonçalo, só depois executar.
- Um commit por mudança que funcione, mensagem clara. Nunca commit de segredos.
- Uma funcionalidade só está feita depois de testada a correr no simulador do iPhone.
- Idioma: português europeu na interface, na documentação e nas conversas.

## Stack

- App: Expo (React Native), Expo Router, TypeScript, iOS primeiro
- Backend: Supabase (Postgres, RLS em todas as tabelas, Auth, Edge Functions, Storage)
- Login: Iniciar sessão com a Apple
- Pagamentos: Superwall + StoreKit (paywall no fim do onboarding)
- Analytics: PostHog · Erros: Sentry · Emails: Resend (a partir de Edge Functions)
- Publicação: Xcode → TestFlight → App Store; correções rápidas com EAS Update

## Regras que não se negoceiam

1. Chaves secretas (OpenAI, Claude, service role do Supabase, Resend) nunca dentro da app. Só em Edge Functions.
2. RLS ativo em todas as tabelas.
3. Requisitos da Apple: Sign in with Apple se houver outro login social, apagar conta dentro da app (revogar token da Apple), política de privacidade e termos, restaurar compras, nada de "em breve", permissões com justificação.
4. Design system único (cores, tipografia, espaçamentos num só ficheiro). Nada de estilos soltos nos ecrãs.
5. Conteúdo de notícias: só título, fonte, data, link e resumo curto próprio. Nunca texto integral.
6. Aviso legal: o conteúdo não é aconselhamento financeiro.

## Comandos

(A preencher na Fase 1.)

## Arquitetura

(A preencher na Fase 1.)

## Decisões importantes

- Funil de analytics: `app_opened`, `onboarding_completed`, `paywall_viewed`, `subscribed`, `asset_search_performed`.
- Monetização proposta (por aprovar): freemium; grátis até 3 ativos e 7 dias de histórico; Pro sem limites.
- Sign-in assumido antes do paywall (rever com dados do funil).
- Fonte do calendário económico: por decidir.
