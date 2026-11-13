# Fontes de dados — Market Factory News

Verificado em 2026-11-12. Isto é análise técnica, não aconselhamento jurídico. Termos mudam: reconfirmar antes do lançamento público.

## Regra de ouro

Só guardamos **título, fonte, data, ligação para o original e um resumo curto escrito por nós** (nunca o texto do artigo). Mostramos sempre a fonte e levamos o utilizador ao original. Na UE o direito dos editores (art. 15.º da Diretiva 2019/790) não cobre hiperligações nem "palavras isoladas ou extratos muito curtos"; Portugal aplica essa exceção sem condições adicionais. Mesmo assim, só usamos fontes cujos termos o permitam ou que sejam oficiais/públicas.

## Decisão por fonte

| Fonte | Tipo | Feed | Decisão V1 | Notas |
|---|---|---|---|---|
| Federal Reserve | oficial | RSS em federalreserve.gov/feeds (press_all, press_monetary, speeches) | **Incluir** | Conteúdo público do governo dos EUA |
| BCE | oficial | RSS em ecb.europa.eu/rss | **Incluir** | Reutilização permitida com menção da fonte |
| SEC EDGAR | oficial | Atom/RSS | **Incluir** | Obriga a User-Agent identificado com contacto e máx. 10 pedidos/s |
| SEC EDGAR – relatórios 8-K por empresa | oficial | Atom `browse-edgar?action=getcompany&CIK=<símbolo>&type=8-K&output=atom` | **Incluir** (2026-11-13) | Notícias de empresas: saída/entrada de CEO e administradores (Item 5.02), resultados (2.02), aquisições, falência, etc. Só empresas americanas do universo; um pedido por ação a cada execução, com User-Agent identificado |
| Yahoo Finance (RSS) | agregador | RSS não documentado | **Adiar** | Os termos da Yahoo só permitem mostrar o conteúdo do feed sem alterações, com atribuição, sem publicidade e podendo cessar a qualquer momento; o conteúdo é em grande parte de terceiros (agências). Decidir com aconselhamento jurídico antes de monetizar |
| Binance (anúncios) | exchange cripto | API/CMS de anúncios | **Adiar** | É cripto (fora do âmbito ações+forex) e só fala da própria Binance; termos por verificar |
| Banco do Canadá | oficial | RSS 1.0 em bankofcanada.ca/content_type/press-releases/feed/ | **Incluir** (migração 0010) | Termos (bankofcanada.ca/terms): uso livre com atribuição e indicação de alterações; logótipo excluído. Verificado em 2026-11-13 |
| Banco de Inglaterra | oficial | RSS 2.0 em bankofengland.co.uk/rss/news (válido) | **Adiar** | Direitos reservados ao Banco; a página legal só refere descarregar/ver/imprimir (OGL só para a base de dados). Pedir autorização por escrito |
| RBA (Austrália) | oficial | RDF em rba.gov.au/rss/rss-cb-media-releases.xml (válido) | **Adiar** | Aviso de copyright reservado; confirmar se há licença que cubra títulos/ligações |
| Tesouro dos EUA | oficial | Sem RSS (só email GovDelivery) | **Adiar** | Sem feed; possível ler a listagem HTML (conteúdo do governo dos EUA) |
| Comissão Europeia (Press Corner) | oficial | Sem RSS próprio | **Adiar** | Sem feed oficial |
| Eurostat | oficial | Atom da pesquisa; o feed "news releases" devolve atualizações de datasets, não comunicados | **Adiar** | Reutilização permitida com crédito, mas o feed é pouco útil e desatualizado |
| FMI, Banco do Japão, BNS (Suíça) | oficial | RSS existe mas endereço não confirmado | **Adiar** | Rever termos e endereço antes de incluir |
| Banco de Portugal | oficial | Sem RSS de comunicados confirmado | **Adiar** | Rever página de comunicados; possível leitura da listagem HTML (a confirmar termos) |
| CMVM / IR de empresas | oficial | Variável | **Adiar** | Caso a caso, por empresa do universo |
| WSJ | imprensa | feeds.content.dowjones.io | **Excluir** | Termos Dow Jones proíbem usar conteúdo de RSS em produto comercial sem consentimento escrito |
| Bloomberg | agência | feeds.bloomberg.com (não documentados) | **Excluir** | Termos proíbem uso concorrente; sem licença pública. Só com licença |
| Reuters | agência | Sem RSS público desde 2020 | **Excluir** | Só com licença |
| CNBC, FT, MarketWatch | imprensa | RSS existe | **Adiar** | Ler termos de cada um; MarketWatch pertence à Dow Jones (mesmos termos) |
| FXStreet / ForexLive | forex | RSS existe | **Adiar** | Termos mencionam licenças de distribuição; pedir autorização por escrito |
| Seeking Alpha / blogs | opinião | RSS | **Adiar** | Peso baixo; termos por verificar |
| Jornal de Negócios, ECO, Expresso | PT | RSS não confirmado | **Adiar** | Contactar para parceria/autorização |

Consequência: a V1 arranca só com **fontes oficiais** (Fed, BCE, SEC e, desde 2026-11-13, Banco do Canadá). É menos "notícia" e mais "comunicados", mas é sólido do ponto de vista legal e gratuito. Cobertura noticiosa ampla exige licenças ou parcerias (custo) — decisão de negócio para a Fase 5.

## Calendário económico

Decisão (2026-11-12, Gonçalo): fase de teste **sem custos**, só com fontes oficiais gratuitas. O Finance Calendar, que eu tinha dado como grátis, exige conta paga (Starter US$9.99/ano, Build US$9.99/mês); rever se o teste correr bem.

| Fonte | Conteúdo | Estado |
|---|---|---|
| Fed (fomccalendars) | Datas das decisões do FOMC | **Feito** (migração 0005; 2027 provisório) |
| Banco de Inglaterra (upcoming-mpc-dates) | Datas das decisões do MPC | **Feito** (migração 0005) |
| BCE (calendário do Conselho do BCE) | Decisões de política monetária | **Feito** (migração 0006; hora 14:15 de Frankfurt) |
| BLS (bls.ics, atualizado às sextas) | IPC, emprego (NFP), PPI, JOLTS dos EUA | **Feito** na função `ingest-news` (a cada execução: últimos 14 e próximos 120 dias) |
| Finance Calendar | 14 países, consenso e impacto | Pago; adiado |

Limites desta opção: sem consenso/previsão, sem valor "atual" e sem classificação de impacto automática (as decisões de taxas são marcadas como impacto alto; o BLS será mapeado por tabela fixa). Cobre EUA, Reino Unido e Zona Euro (só decisões de taxas na Zona Euro; sem IPC nem PIB europeus).

## Requisitos técnicos da ingestão

- Corre numa Edge Function do Supabase com a chave de serviço **só** no servidor.
- Um pedido por feed por execução, com User-Agent `Market Factory News/1.0 (contacto)`; respeitar cabeçalhos de cache.
- Normalizar, remover duplicados (URL canónico) e associar ativos/temas por palavras-chave.
- Agendar com pg_cron (ex.: a cada 15 min).
