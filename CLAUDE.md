# CLAUDE.md — MarketLens

Site de notícias de ações e forex por ativo e período (web primeiro, app iOS mais tarde), com calendário económico e watchlist. Documentos: `docs/PRD.md` (produto) e `docs/ROADMAP.md` (fases).

Estado atual: **antes da Fase 1** (só documentação). Atualizar esta secção no fim de cada fase.

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

## Comandos

(A preencher na Fase 1.)

## Arquitetura

(A preencher na Fase 1.)

## Decisões importantes

- Funil de analytics: `app_opened`, `onboarding_completed`, `asset_search_performed`. `paywall_viewed` e `subscribed` entram na Fase 5.
- Monetização adiada (decisão do Gonçalo): primeiro fluxo de utilizadores. Depois, subscrição Pro e/ou publicidade. Não assumir "tudo gratuito" espalhado pelo código: usar um único ponto de verificação de permissões quando houver planos.
- Fonte do calendário económico: por decidir.
- Web primeiro (decisão do Gonçalo: sem investimento inicial; não tem Mac). Framework: Expo Router web. Se o SEO for insuficiente, migrar o site para Next.js reaproveitando o backend.
