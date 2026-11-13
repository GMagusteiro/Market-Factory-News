import re
import sys
from playwright.sync_api import sync_playwright, expect

BASE = "http://localhost:3000"
PT_STATE = {"cookies": [], "origins": [{"origin": BASE, "localStorage": [{"name": "marketlens.lang.v1", "value": "pt"}]}]}
results = []


def check(name, condition, detail=""):
    results.append((name, bool(condition), detail))
    print(("PASS " if condition else "FAIL ") + name + (f"  [{detail}]" if detail else ""))


def go(pg, url):
    pg.goto(url)
    pg.wait_for_load_state("networkidle")
    pg.wait_for_timeout(500)


def count_in_period(page):
    text = page.locator("text=/\\d+ no período escolhido/").first.inner_text()
    return int(re.search(r"(\d+)", text).group(1))


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True, args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 1280, "height": 900}, locale="pt-PT", storage_state=PT_STATE)
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text else None)

    # 1. Home
    go(page, BASE + "/")
    expect(page.get_by_role("heading", name=re.compile("Notícias de ações e forex"))).to_be_visible()
    check("home: título e banner de dados de exemplo", page.get_by_text("Dados de exemplo").is_visible())
    check("home: <title> correto", "MarketLens" in page.title(), page.title())
    page.screenshot(path="/tmp/shots/01_home.png")

    # 1b. Em destaque (relevância por tema)
    expect(page.get_by_role("heading", name="Em destaque")).to_be_visible()
    cards = page.locator("[aria-label^='História:']")
    check("destaque: 3 histórias (a de 40h e as de uma só fonte ficam de fora)", cards.count() == 3, f"{cards.count()}")
    first = cards.first.inner_text()
    check("destaque: a mais relevante é a dos juros, com fontes e relevância", "taxas de juro" in first.lower() and "Relevância" in first and "4 fontes" in first, first[:80].replace("\n", " "))
    ima = page.locator("[aria-label^='História: Governo anuncia']")
    check("destaque: história dos ímanes liga a MP e LYC sem os nomear",
          ima.get_by_role("button", name="MP", exact=True).is_visible() and ima.get_by_role("button", name="LYC", exact=True).is_visible()
          and "MP Materials" not in ima.inner_text())
    check("destaque: aviso de que não é recomendação", page.get_by_text("Não são recomendações de investimento").is_visible())
    page.screenshot(path="/tmp/shots/09_highlights.png", full_page=True)
    ima.get_by_role("button", name="MP", exact=True).click()
    page.wait_for_url("**/ativo/mp")
    expect(page.get_by_role("heading", name="MP Materials")).to_be_visible()
    page.get_by_role("button", name="30 dias").click()
    themed = page.get_by_text("Tema: Terras raras e ímanes").count()
    check("ativo MP: mostra as 3 notícias ligadas pelo tema", themed == 3, f"{themed}")
    check("ativo MP: explica que não menciona o ativo diretamente", page.get_by_text("Não menciona o ativo diretamente").first.is_visible())
    page.screenshot(path="/tmp/shots/10_mp_theme.png", full_page=True)
    go(page, BASE + "/")
    page.get_by_label("Pesquisar ativo").fill("terras raras")
    check("pesquisa: 'terras raras' encontra MP e LYC",
          page.get_by_role("button", name="MP Materials (MP)").is_visible() and page.get_by_role("button", name="Lynas Rare Earths (LYC)").is_visible())
    page.get_by_label("Pesquisar ativo").fill("")

    # 2. Pesquisa e dropdown
    box = page.get_by_label("Pesquisar ativo")
    box.fill("nvid")
    sug = page.get_by_role("button", name="NVIDIA (NVDA)")
    expect(sug).to_be_visible()
    check("pesquisa: dropdown mostra NVIDIA ao escrever 'nvid'", True)
    page.screenshot(path="/tmp/shots/02_dropdown.png")
    sug.click()
    page.wait_for_url("**/ativo/nvda")
    expect(page.get_by_role("heading", name="NVIDIA")).to_be_visible()
    check("pesquisa: clicar leva a /ativo/nvda", True)

    # 3. Filtro de períodos
    expect(page.locator("text=/\\d+ no período escolhido/").first).to_be_visible()
    n7 = count_in_period(page)
    page.get_by_role("button", name="Últimas 24h").click()
    n24 = count_in_period(page)
    page.get_by_role("button", name="30 dias").click()
    n30 = count_in_period(page)
    check("período: 24h <= 7d < 30d", n24 <= n7 < n30, f"24h={n24} 7d={n7} 30d={n30}")
    items = page.locator("[role=link][aria-label*='Abre o artigo original']").count()
    check("período: nº de cartões = contagem mostrada", items == n30, f"{items} vs {n30}")
    check("notícias: tem etiqueta de tipo e fonte",
          page.get_by_text("Opinião", exact=True).first.is_visible() and page.get_by_text("Agência Exemplo").first.is_visible())
    page.screenshot(path="/tmp/shots/03_asset_30d.png", full_page=True)

    # 4. Período personalizado
    page.get_by_role("button", name="Personalizado").click()
    page.get_by_label("Data inicial").fill("2026-11-12")
    page.get_by_label("Data final").fill("2026-11-01")
    check("custom: datas invertidas mostram erro", page.get_by_text("Datas inválidas").is_visible())
    page.get_by_label("Data inicial").fill("2026-11-01")
    page.get_by_label("Data final").fill("2026-11-12")
    check("custom: datas válidas escondem o erro", page.get_by_text("Datas inválidas").count() == 0)
    ncustom = count_in_period(page)
    check("custom: 1-12 nov devolve notícias", ncustom > 0, f"{ncustom}")
    page.get_by_label("Data inicial").fill("2026-01-01")
    page.get_by_label("Data final").fill("2026-01-05")
    check("custom: período sem notícias mostra estado vazio", page.get_by_text("Sem notícias para este ativo").is_visible())

    # 5. Eventos macro no ativo
    page.get_by_role("button", name="7 dias").click()
    check("ativo: secção de eventos macro relacionados", page.get_by_text("Eventos macro relacionados").is_visible())

    # 6. Watchlist
    page.get_by_role("button", name="Seguir NVIDIA").click()
    expect(page.get_by_role("button", name="Deixar de seguir NVIDIA")).to_be_visible()
    check("watchlist: botão passa a 'A seguir'", True)
    expect(page.get_by_role("link", name="Watchlist (1)")).to_be_visible()
    check("watchlist: contador na navegação", True)
    page.reload()
    expect(page.get_by_role("button", name="Deixar de seguir NVIDIA")).to_be_visible()
    check("watchlist: persiste depois de recarregar", True)
    page.get_by_role("link", name=re.compile("Watchlist")).click()
    page.wait_for_url("**/watchlist")
    expect(page.get_by_text("Ativos que segues")).to_be_visible()
    check("watchlist: ecrã lista NVIDIA", page.get_by_role("button", name="Ver NVIDIA").is_visible())
    expect(page.locator("text=/\\d+ notícia\\(s\\) no período escolhido/")).to_be_visible()
    page.screenshot(path="/tmp/shots/04_watchlist.png", full_page=True)
    page.get_by_role("button", name="Deixar de seguir NVIDIA").click()
    expect(page.get_by_text("Ainda não segues nenhum ativo")).to_be_visible()
    check("watchlist: remover volta ao estado vazio", True)

    # 7. Forex + calendário
    go(page, BASE + "/ativo/eur-usd")
    expect(page.get_by_role("heading", name="Euro / Dólar americano")).to_be_visible()
    check("forex: página de EUR/USD", page.get_by_text("Par forex").first.is_visible())
    go(page, BASE + "/calendario")
    expect(page.get_by_role("heading", name="Calendário económico")).to_be_visible()
    all_rows = page.get_by_text(re.compile("^Impacto (alto|médio|baixo)$")).count()
    page.get_by_role("button", name="Alto", exact=True).click()
    high_rows = page.get_by_text(re.compile("^Impacto alto$")).count()
    other = page.get_by_text(re.compile("^Impacto (médio|baixo)$")).count()
    check("calendário: filtro 'Alto' mostra só impacto alto", high_rows > 0 and other == 0 and high_rows < all_rows,
          f"todos={all_rows} alto={high_rows} outros={other}")
    page.get_by_role("button", name="Últimos 14 dias").click()
    check("calendário: vista de passados tem eventos", page.get_by_text(re.compile("^Impacto")).count() > 0)
    page.screenshot(path="/tmp/shots/05_calendar.png", full_page=True)

    # 8. Aviso legal e rota inexistente
    check("aviso legal visível", page.get_by_text("Não constitui aconselhamento financeiro").is_visible())
    go(page, BASE + "/ativo/xxxx")
    check("ativo inexistente mostra mensagem", page.get_by_text("Ativo não encontrado").is_visible())

    # 9. Telemóvel
    m = browser.new_context(viewport={"width": 390, "height": 844}, locale="pt-PT", storage_state=PT_STATE, is_mobile=True, has_touch=True)
    mp = m.new_page()
    go(mp, BASE + "/ativo/aapl")
    expect(mp.get_by_role("heading", name="Apple")).to_be_visible()
    overflow = mp.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    check("telemóvel: sem scroll horizontal", not overflow)
    mp.screenshot(path="/tmp/shots/06_mobile_asset.png", full_page=True)
    go(mp, BASE + "/")
    mp.get_by_label("Pesquisar ativo").fill("eur")
    expect(mp.get_by_role("button", name="(EUR/USD)")).to_be_visible()
    mp.screenshot(path="/tmp/shots/07_mobile_dropdown.png")

    real_errors = [e for e in errors if "favicon" not in e.lower() and "status of 404" not in e]
    check("sem erros na consola", len(real_errors) == 0, "; ".join(real_errors[:3]))
    browser.close()

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} verificações passaram")
sys.exit(1 if failed else 0)
