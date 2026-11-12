# PRD — MarketLens (nome de trabalho)

Estado: **rascunho v0.1**. A secção de monetização é uma proposta e aguarda aprovação.

## 1. Problema

Quem acompanha ações e forex hoje salta entre 3 ou 4 sites para saber o que aconteceu com uma empresa ou uma moeda: um site de notícias, um calendário económico, um agregador, um fórum. Três dores concretas:

1. **Perde-se tempo a procurar.** Para saber o que se passou com a NVIDIA na última semana é preciso visitar vários sítios e filtrar ruído à mão.
2. **Não se confia nas fontes.** Há muito conteúdo de baixa qualidade e opinião disfarçada de notícia. Falta saber de onde vem cada coisa e que tipo de conteúdo é.
3. **Falta ligar a notícia ao contexto macro.** A notícia da empresa e o evento do calendário económico desse dia vivem em sítios separados.

## 2. Utilizador-alvo

Investidor/trader que acompanha **ações e forex em simultâneo** e hoje usa vários sites para isso. Segue pelo menos 5 a 10 ativos, consulta notícias diariamente e valoriza rapidez e fontes fiáveis mais do que gráficos avançados.

Não é para: quem quer executar ordens, sinais de compra/venda ou aconselhamento financeiro.

## 3. Proposta de valor

Escolhes um ativo (ex.: NVIDIA, EUR/USD), escolhes um período, e vês só as notícias relevantes, de fontes selecionadas, com a fonte e o tipo de cada artigo à vista, ao lado dos eventos macro desse período.

## 4. Funcionalidades da V1 (dia 1)

| # | Funcionalidade | Descrição |
|---|---|---|
| F1 | **Pesquisa por ativo + período** (ação principal) | Pesquisa/dropdown de ativos (ações e pares forex). Filtro de datas: 24h, 7 dias, 30 dias, personalizado. Lista de notícias com título, fonte, data e link para o original. |
| F2 | **Watchlist pessoal** | Guardar ativos e ver um feed só com esses. |
| F3 | **Calendário económico** | Eventos macro com data/hora, moeda/país e impacto (baixo/médio/alto), com ligação aos ativos afetados. |
| F4 | **Etiqueta de fonte e tipo** | Cada artigo mostra a fonte e o tipo: notícia, opinião ou comunicado oficial. |

Infraestrutura mínima que as funcionalidades exigem: login com Apple, eliminar conta, política de privacidade e termos, restaurar compras, aviso de que o conteúdo não é aconselhamento financeiro.

## 5. Fora da V1

- Alertas e notificações push
- Resumos com IA (candidato natural para uma versão 2, via Edge Function)
- Android e web
- Criptomoedas, matérias-primas e outros ativos
- Cotações em tempo real, gráficos e análise técnica
- Comunidade, fórum ou comentários
- Execução de ordens ou ligação a corretoras
- Texto integral dos artigos (só título, fonte, data, link e resumo curto próprio)
- Notícias em vários idiomas além de inglês e português

Idioma da interface: português europeu. Conteúdo: sobretudo inglês, com fontes portuguesas onde existirem.

## 6. Fluxo do utilizador (primeiro ecrã → paywall)

1. **Boas-vindas**: uma frase de valor e botão "Começar".
2. **Proposta de valor** (2 ecrãs curtos): "Todas as notícias de um ativo num só sítio" e "Fontes que podes verificar".
3. **Mercados de interesse**: ações, forex ou ambos.
4. **Escolher ativos**: pelo menos 3 para a watchlist inicial (sugestões populares + pesquisa). Mostra logo uma pré-visualização com notícias reais do primeiro ativo.
5. **Iniciar sessão com a Apple**: guarda a watchlist e liga a subscrição à conta.
6. **Paywall (Superwall)**: apresenta o plano Pro, com botão de restaurar compras e opção de continuar no plano gratuito.
7. **Ecrã principal**: feed da watchlist, com pesquisa e calendário.

Decisão em aberto: sign-in antes ou depois do paywall. Assumimos antes, por simplicidade (sem migrar dados anónimos). Revê-se com os dados do funil.

## 7. Monetização (proposta a aprovar)

Modelo **freemium com subscrição** (o paywall aparece no fim do onboarding):

- **Grátis**: até 3 ativos na watchlist, histórico de 7 dias, calendário económico.
- **Pro**: watchlist ilimitada, histórico completo, filtros por tipo de fonte. Mais tarde: alertas.
- **Preços a testar**: cerca de 4,99 €/mês e 39,99 €/ano, com 7 dias de teste. São hipóteses, a calibrar no Superwall com dados reais.

Risco assumido: as notícias já estão disponíveis gratuitamente noutros sítios, por isso a disposição para pagar é incerta. O valor a vender é poupança de tempo e qualidade de curadoria, não o acesso à informação.

## 8. Como medimos se funciona

**Eventos do funil (PostHog):** `app_opened`, `onboarding_completed`, `paywall_viewed`, `subscribed`, `asset_search_performed` (ação principal).
Eventos de apoio: `watchlist_asset_added`, `calendar_viewed`, `article_opened`.

**Métricas e metas iniciais** (hipóteses, a calibrar com as primeiras 100 a 200 pessoas):

| Métrica | Meta inicial |
|---|---|
| Onboarding concluído / app aberta | > 60% |
| Fez a ação principal na primeira sessão | > 50% |
| Paywall visto → trial/subscrição | 3–8% |
| Retorno no dia 7 | > 20% |

Qualidade: erros e crashes no Sentry, sessões sem crash > 99%.

## 9. Riscos e questões em aberto

1. **Fonte do calendário económico.** O Forex Factory não tem API oficial. É preciso escolher uma fonte com licença adequada (decidir no plano da Fase 1/2).
2. **Licenças de conteúdo.** Planos gratuitos de APIs de notícias costumam ser para uso pessoal. Para uma app pública é provável que seja preciso um plano pago, ou usar RSS e fontes primárias (SEC, bancos centrais). Mostramos só título, fonte, data, link e resumo curto.
3. **Relevância.** Associar bem uma notícia a uma empresa (aliases, ambiguidade de tickers) e agrupar duplicados.
4. **Disposição para pagar** (ver secção 7).
5. **Regras da App Store.** App financeira de notícias: não dar aconselhamento, incluir aviso legal, apagar conta in-app e revogar o token da Apple ao apagar.
