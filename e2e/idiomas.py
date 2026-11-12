import re, sys
from playwright.sync_api import sync_playwright, expect
BASE = "http://localhost:3000"
results = []
def check(n, c, d=""):
    results.append(bool(c)); print(("PASS " if c else "FAIL ") + n + (f"  [{d}]" if d else ""))
def go(pg, url):
    pg.goto(url); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(600)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True, args=["--no-sandbox"])
    # Browser em inglês: deteta sozinho
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, locale="en-GB")
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    go(pg, BASE + "/")
    check("browser em inglês: site abre em inglês", pg.get_by_role("heading", name="Stock and forex news, by asset and period").is_visible())
    check("html lang = en", pg.evaluate("document.documentElement.lang") == "en")
    check("sem aviso de hidratação/erros", not errs, "; ".join(errs[:2]))
    pg.get_by_role("radio", name="Español").click()
    expect(pg.get_by_role("heading", name="Noticias de acciones y forex, por activo y periodo")).to_be_visible()
    check("troca para espanhol", True)
    check("html lang = es", pg.evaluate("document.documentElement.lang") == "es")
    go(pg, BASE + "/ativo/nvda")
    check("escolha persiste ao navegar/recarregar (ES)", pg.get_by_role("button", name="7 días", exact=True).is_visible())
    check("ativo: botão Seguir em espanhol", pg.get_by_role("button", name="Seguir NVIDIA").is_visible())
    check("ativo: tipo de notícia traduzido", pg.get_by_text("Comunicado oficial").count() > 0 or pg.get_by_text("Noticia").count() > 0)
    go(pg, BASE + "/calendario")
    check("calendário em espanhol", pg.get_by_role("heading", name="Calendario económico").is_visible())
    check("datas em espanhol (dia da semana)", re.search(r"(lunes|martes|miércoles|jueves|viernes|sábado|domingo)", pg.locator("body").inner_text().lower()) is not None)
    pg.get_by_role("radio", name="English").click()
    check("calendário em inglês", pg.get_by_role("heading", name="Economic calendar").is_visible())
    check("datas em inglês", re.search(r"(monday|tuesday|wednesday|thursday|friday|saturday|sunday)", pg.locator("body").inner_text().lower()) is not None)
    check("aviso legal em inglês", pg.get_by_text("not financial advice").is_visible())
    pg.get_by_role("radio", name="Português").click()
    check("volta a português", pg.get_by_role("heading", name="Calendário económico").is_visible())
    go(pg, BASE + "/ativo/mp")
    pg.get_by_role("radio", name="English").click()
    pg.get_by_role("button", name="30 days", exact=True).click()
    check("tema traduzido (Rare earths and magnets)", pg.get_by_text("Theme: Rare earths and magnets").count() == 3, f"{pg.get_by_text('Theme: Rare earths and magnets').count()}")
    pg.screenshot(path="/tmp/shots/30_en_asset.png", full_page=True)
    # Telemóvel: o seletor cabe no ecrã
    m = b.new_context(viewport={"width": 390, "height": 844}, locale="es-ES", is_mobile=True, has_touch=True).new_page()
    go(m, BASE + "/")
    check("telemóvel: deteta espanhol", m.get_by_role("heading", name=re.compile("Noticias de acciones")).is_visible())
    check("telemóvel: sem scroll horizontal", not m.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth"))
    m.screenshot(path="/tmp/shots/31_es_mobile.png")
    b.close()
print(f"{sum(results)}/{len(results)}"); sys.exit(0 if all(results) else 1)
