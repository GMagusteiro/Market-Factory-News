# Fontes de dados — MarketLens

Verificado em 2026-11-12. Isto é análise técnica, não aconselhamento jurídico. Termos mudam: reconfirmar antes do lançamento público.

## Regra de ouro

Só guardamos **título, fonte, data, ligação para o original e um resumo curto escrito por nós** (nunca o texto do artigo). Mostramos sempre a fonte e levamos o utilizador ao original. Na UE o direito dos editores (art. 15.º da Diretiva 2019/790) não cobre hiperligações nem "palavras isoladas ou extratos muito curtos"; Portugal aplica essa exceção sem condições adicionais. Mesmo assim, só usamos fontes cujos termos o permitam ou que sejam oficiais/públicas.

## Decisão por fonte

| Fonte | Tipo | Feed | Decisão V1 | Notas |
|---|---|---|---|---|
| Federal Reserve | oficial | RSS em federalreserve.gov/feeds (press_all, press_monetary, speeches) | **Incluir** | Conteúdo público do governo dos EUA |
| BCE | oficial | RSS em ecb.europa.eu/rss | **Incluir** | Reutilização permitida com menção da fonte |
| SEC EDGAR | oficial | Atom/RSS | **Incluir** | Obriga a User-Agent identificado com contacto e máx. 10 pedidos/s |
| Banco de Portugal | oficial | Sem RSS de comunicados confirmado | **Adiar** | Rever página de comunicados; possível leitura da listagem HTML (a confirmar termos) |
| CMVM / IR de empresas | oficial | Variável | **Adiar** | Caso a caso, por empresa do universo |
| WSJ | imprensa | feeds.content.dowjones.io | **Excluir** | Termos Dow Jones proíbem usar conteúdo de RSS em produto comercial sem consentimento escrito |
| Bloomberg | agência | feeds.bloomberg.com (não documentados) | **Excluir** | Termos proíbem uso concorrente; sem licença pública. Só com licença |
| Reuters | agência | Sem RSS público desde 2020 | **Excluir** | Só com licença |
| CNBC, FT, MarketWatch | imprensa | RSS existe | **Adiar** | Ler termos de cada um; MarketWatch pertence à Dow Jones (mesmos termos) |
| FXStreet / ForexLive | forex | RSS existe | **Adiar** | Termos mencionam licenças de distribuição; pedir autorização por escrito |
| Seeking Alpha / blogs | opinião | RSS | **Adiar** | Peso baixo; termos por verificar |
| Jornal de Negócios, ECO, Expresso | PT | RSS não confirmado | **Adiar** | Contactar para parceria/autorização |

Consequência: a V1 arranca só com **fontes oficiais** (Fed, BCE, SEC). É menos "notícia" e mais "comunicados", mas é sólido do ponto de vista legal e gratuito. Cobertura noticiosa ampla exige licenças ou parcerias (custo) — decisão de negócio para a Fase 5.

## Calendário económico

| Opção | Custo | Uso comercial | Decisão |
|---|---|---|---|
| Finance Calendar API | Grátis, sem chave (2000 pedidos/dia por IP; mais com chave grátis) | Sim, com ligação visível a financecalendar.com | **Escolhida** |
| Forex Factory / Investing.com | Sem API | Proibido copiar/redistribuir | Excluir |
| Finnhub, Trading Economics | Pago | — | Excluir |
| FRED / ONS / Bank of England | Grátis | Oficiais, só EUA/Reino Unido | Complemento possível |

Cobertura: 14 países e as principais divulgações (não todas as menores). Obriga a atribuição visível no ecrã do calendário. Aviso: não inclui datas de resultados de empresas.

## Requisitos técnicos da ingestão

- Corre numa Edge Function do Supabase com a chave de serviço **só** no servidor.
- Um pedido por feed por execução, com User-Agent `MarketLens/1.0 (contacto)`; respeitar cabeçalhos de cache.
- Normalizar, remover duplicados (URL canónico) e associar ativos/temas por palavras-chave.
- Agendar com pg_cron (ex.: a cada 15 min).
