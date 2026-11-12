# PRD — MarketLens (nome de trabalho)

Estado: **rascunho v0.3**. Web primeiro (sem investimento inicial); a app iOS vem depois. Monetização adiada: primeiro construímos valor e fluxo de utilizadores (ver secção 7).

## 1. Problema

Quem acompanha ações e forex hoje salta entre 3 ou 4 sites para saber o que aconteceu com uma empresa ou uma moeda: um site de notícias, um calendário económico, um agregador, um fórum. Três dores concretas:

1. **Perde-se tempo a procurar.** Para saber o que se passou com a NVIDIA na última semana é preciso visitar vários sítios e filtrar ruído à mão.
2. **Não se confia nas fontes.** Há muito conteúdo de baixa qualidade e opinião disfarçada de notícia. Falta saber de onde vem cada coisa e que tipo de conteúdo é.
3. **Falta ligar a notícia ao contexto macro.** A notícia da empresa e o evento do calendário económico desse dia vivem em sítios separados.
4. **Notícias que mexem com um ativo sem o nomearem.** Uma declaração política ou uma decisão regulatória sobre um tema (ex.: ímanes e terras raras) pode mover as empresas desse setor, mas a notícia não as menciona. Pesquisar só pelo nome da empresa não as encontra.

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
| F5 | **Notícias relevantes por tema** | Notícias ligadas a ativos através de temas, e uma lista "Em destaque" com as histórias mais relevantes (ver abaixo). |

### F5: notícias relevantes por tema (diferenciador)

Para além das menções diretas, a app liga notícias a ativos através de **temas** (ex.: terras raras, semicondutores e IA, taxas de juro, energia). Cada ativo pertence a zero ou mais temas. Uma notícia sobre um tema aparece nas páginas dos ativos desse tema, com a indicação "Tema: …", e conta como notícia relevante para esses ativos.

A página inicial tem **Em destaque**: as histórias mais relevantes das últimas 24 horas. Uma "história" agrupa os artigos que contam o mesmo acontecimento. A pontuação de relevância (0 a 100) combina:

| Fator | Peso | Ideia |
|---|---|---|
| Recência | 35% | Decai para metade a cada 24 horas |
| Confirmação | 30% | Quantas fontes diferentes cobrem a mesma história (máx. 5) |
| Fiabilidade da fonte | 20% | Agências e comunicados oficiais pesam mais do que opinião |
| Alcance | 15% | Quantos ativos (diretos e por tema) podem ser afetados (máx. 6) |

Só entram em destaque histórias com pelo menos 2 fontes. A lista mostra os "ativos potencialmente relacionados" de cada história.

Regras de comunicação: é informação, nunca recomendação. Não escrevemos "comprar", "vender" nem previsões; escrevemos "potencialmente relacionado". Uma história relevante não implica que o preço suba ou desça.

Versão posterior (fora da V1): classificação por IA para descobrir ligações que as regras não apanham, e sinais de preço e volume para confirmar movimentos reais.

Infraestrutura mínima que as funcionalidades exigem: conta por email (ligação mágica) ou Google, eliminar conta, política de privacidade e termos, consentimento de cookies, aviso de que o conteúdo não é aconselhamento financeiro. Na V1 tudo é gratuito e sem limites.

## 5. Fora da V1

- Paywall, subscrições e publicidade (adiados, ver secção 7)
- Alertas e notificações push
- Resumos com IA (candidato natural para uma versão 2, via Edge Function)
- App iOS e Android (a V1 é só site)
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
5. **Criar conta** (email com ligação mágica ou Google): guarda e sincroniza a watchlist. A pesquisa e o calendário funcionam sem conta.
6. **Ecrã principal**: feed da watchlist, com pesquisa e calendário.

O fluxo termina aqui na V1. O lugar do paywall (entre os passos 5 e 6) fica reservado para quando a monetização entrar.

## 7. Monetização (adiada)

Decisão: **não monetizamos na V1**. Primeiro garantimos que há utilizadores que voltam; quando houver fluxo, passamos a exigir mais valor. Opções para depois, por ordem de probabilidade:

1. **Subscrição Pro** (na web, por exemplo Stripe; Superwall + StoreKit só na app): limites no plano gratuito (ex.: nº de ativos, histórico) e extras como alertas. Preços só se definem com dados reais.
2. **Publicidade**: só com tráfego que a justifique. Na web exige consentimento de cookies (RGPD) e aprovação da rede de anúncios, e o rendimento por visita costuma ser baixo.

Risco assumido: as notícias já estão disponíveis gratuitamente noutros sítios. O valor a vender é poupança de tempo e qualidade de curadoria, não o acesso à informação.

Preparação sem custo: o código evita assumir "tudo gratuito" em sítios espalhados (um único ponto de verificação de permissões, a criar quando houver planos).

## 8. Como medimos se funciona

**Eventos do funil (PostHog):** `app_opened`, `onboarding_completed`, `asset_search_performed` (ação principal). Quando a monetização entrar acrescentam-se `paywall_viewed` e `subscribed`.
Eventos de apoio: `watchlist_asset_added`, `calendar_viewed`, `article_opened`.

**Métricas e metas iniciais** (hipóteses, a calibrar com as primeiras 100 a 200 pessoas):

| Métrica | Meta inicial |
|---|---|
| Onboarding concluído / app aberta | > 60% |
| Fez a ação principal na primeira sessão | > 50% |
| Abriu um artigo (clique para a fonte) por sessão | ≥ 1 |
| Retorno no dia 7 | > 20% |

Qualidade: erros e crashes no Sentry, sessões sem crash > 99%.

## 9. Riscos e questões em aberto

1. **Fonte do calendário económico.** O Forex Factory não tem API oficial. É preciso escolher uma fonte com licença adequada (decidir no plano da Fase 1/2).
2. **Licenças de conteúdo.** Planos gratuitos de APIs de notícias costumam ser para uso pessoal. Para uma app pública é provável que seja preciso um plano pago, ou usar RSS e fontes primárias (SEC, bancos centrais). Mostramos só título, fonte, data, link e resumo curto.
3. **Relevância.** Associar bem uma notícia a uma empresa (aliases, ambiguidade de tickers) e agrupar duplicados.
4. **Retenção.** Sem monetização, o sinal de sucesso é o utilizador voltar. Se o retorno ao dia 7 for baixo, rever o produto antes de pensar em receita.
5. **Regras legais.** Site financeiro de notícias: não dar aconselhamento, incluir aviso legal, RGPD (cookies, apagar conta). As regras da App Store só contam na fase da app.
6. **SEO com Expo Router.** Para as páginas por ativo aparecerem no Google é preciso usar a saída web estática. A web é secundária no Expo; se o SEO se mostrar insuficiente, migrar o site para Next.js reaproveitando o backend.
