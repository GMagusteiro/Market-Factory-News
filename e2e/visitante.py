import re, sys
from playwright.sync_api import sync_playwright, expect
BASE = "http://localhost:3000"
PT_STATE = {"cookies": [], "origins": [{"origin": BASE, "localStorage": [{"name": "marketlens.lang.v1", "value": "pt"}]}]}
results = []
def check(n, c, d=""):
    results.append(bool(c)); print(("PASS " if c else "FAIL ") + n + (f"  [{d}]" if d else ""))
def go(pg, url):
    pg.goto(url); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(600)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True, args=["--no-sandbox"])
    pg = b.new_context(viewport={"width": 1280, "height": 900}, locale="pt-PT", storage_state=PT_STATE).new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    go(pg, BASE + "/")
    check("nav: visitante vê 'Entrar'", pg.get_by_role("link", name="Entrar").is_visible())
    go(pg, BASE + "/ativo/nvda")
    check("ativo: 30 dias marcado como 'com conta'", pg.get_by_role("button", name="30 dias · com conta").is_visible())
    check("ativo: 7 dias livre", pg.get_by_role("button", name="7 dias", exact=True).is_visible())
    pg.get_by_role("button", name="30 dias · com conta").click()
    pg.wait_for_url("**/conta")
    expect(pg.get_by_role("heading", name="Entrar ou criar conta")).to_be_visible()
    check("conta: mostra o que o registo dá", pg.get_by_text("Watchlist sincronizada entre dispositivos").is_visible())
    pg.get_by_label("Email").fill("invalido")
    pg.get_by_role("button", name="Enviar ligação de acesso").click()
    check("conta: email inválido dá erro", pg.get_by_text("Escreve um email válido.").is_visible())
    pg.screenshot(path="/tmp/shots/20_conta.png", full_page=True)
    go(pg, BASE + "/calendario")
    check("calendário: visitante vê 60 dias à frente", pg.get_by_role("button", name="Próximos 60 dias").is_visible())
    check("calendário: histórico sem registo", pg.get_by_role("button", name="Últimos 14 dias", exact=True).is_visible())
    # watchlist de visitante continua local
    go(pg, BASE + "/ativo/nvda")
    pg.get_by_role("button", name="Seguir NVIDIA").click()
    check("watchlist de visitante funciona sem conta", pg.get_by_role("button", name="Deixar de seguir NVIDIA").is_visible())
    real = [e for e in errs if "favicon" not in e.lower()]
    check("sem erros de página", not real, "; ".join(real[:2]))
    b.close()
print(f"{sum(results)}/{len(results)}"); sys.exit(0 if all(results) else 1)
